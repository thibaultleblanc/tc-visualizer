#!/usr/bin/env bash
set -euo pipefail
set -x

# Interfaces de test (dummy) pour exécution en conteneur
IF0=itf1
IF1=itf2
IF2=itf3

# Hypothèses de débit des interfaces (en mbit)
ITF1_BW=1000
ITF2_BW=1000
ITF3_BW=1000

# Parametres de matching (en dur)
API_CLIENTS_SUBNET="10.10.10.0"
API_CLIENTS_MASK="24"
CLOUD_BACKUP_SUBNET="10.20.30.0"
CLOUD_BACKUP_MASK="24"
NAS_IP="10.30.40.10"
INTERSITE_SUBNET="10.40.0.0"
INTERSITE_MASK="16"

# Crée et active une interface dummy si nécessaire.
ensure_dummy_iface() {
  local ifname="$1"
  if ! ip link show dev "$ifname" >/dev/null 2>&1; then
    ip link add "$ifname" type dummy
  fi
  ip link set "$ifname" up
}

ensure_dummy_iface "$IF0"
ensure_dummy_iface "$IF1"
ensure_dummy_iface "$IF2"

# Nettoyage
tc qdisc del dev "$IF0" root 2>/dev/null || true
tc qdisc del dev "$IF1" root 2>/dev/null || true
tc qdisc del dev "$IF2" root 2>/dev/null || true

#######################################
# ITF1
# API clients 40% (prio 0)
# Site web 30% (prio 1)
# Sauvegardes cloud 10% (prio 3, max 100mbit)
#######################################
tc qdisc add dev "$IF0" root handle 10: htb default 199 r2q 10000
tc class add dev "$IF0" parent 10: classid 10:1 htb rate ${ITF1_BW}mbit ceil ${ITF1_BW}mbit

tc class add dev "$IF0" parent 10:1 classid 10:10 htb rate 400mbit ceil 400mbit prio 0
tc class add dev "$IF0" parent 10:1 classid 10:20 htb rate 300mbit ceil 300mbit prio 1
tc class add dev "$IF0" parent 10:1 classid 10:30 htb rate 100mbit ceil 100mbit prio 3
tc class add dev "$IF0" parent 10:1 classid 10:199 htb rate 200mbit ceil 1000mbit prio 7

# Queue class-less sous HTB
tc qdisc add dev "$IF0" parent 10:10 handle 110: fq_codel target 5ms interval 100ms ecn # API
tc qdisc add dev "$IF0" parent 10:20 handle 120: fq_codel target 5ms interval 100ms ecn # Site web
tc qdisc add dev "$IF0" parent 10:30 handle 130: tbf rate 100mbit burst 64kbit latency 50ms # Sauvegardes cloud

# Classification (exemples)
# API clients
tc filter add dev "$IF0" protocol ip parent 10: prio 1 u32 \
  match ip dst ${API_CLIENTS_SUBNET}/${API_CLIENTS_MASK} flowid 10:10

# Site web (HTTP/HTTPS)
tc filter add dev "$IF0" protocol ip parent 10: prio 2 u32 \
  match ip dport 80 0xffff flowid 10:20
tc filter add dev "$IF0" protocol ip parent 10: prio 2 u32 \
  match ip dport 443 0xffff flowid 10:20

# Sauvegardes cloud
tc filter add dev "$IF0" protocol ip parent 10: prio 3 u32 \
  match ip dst ${CLOUD_BACKUP_SUBNET}/${CLOUD_BACKUP_MASK} flowid 10:30

#######################################
# ITF2
# VoIP 30% (prio 0, SFQ, DSCP EF)
# Visioconférence 40% (prio 1)
# NAS 20% (prio 2, max 200mbit)
#######################################
tc qdisc add dev "$IF1" root handle 20: htb default 299 r2q 10000
tc class add dev "$IF1" parent 20: classid 20:1 htb rate ${ITF2_BW}mbit ceil ${ITF2_BW}mbit

tc class add dev "$IF1" parent 20:1 classid 20:10 htb rate 300mbit ceil 300mbit prio 0
tc class add dev "$IF1" parent 20:1 classid 20:20 htb rate 400mbit ceil 400mbit prio 1
tc class add dev "$IF1" parent 20:1 classid 20:30 htb rate 200mbit ceil 200mbit prio 2
tc class add dev "$IF1" parent 20:1 classid 20:299 htb rate 100mbit ceil 1000mbit prio 7

# VoIP: SFQ + DSCP EF
tc qdisc add dev "$IF1" parent 20:10 handle 210: sfq perturb 10 # VoIP
# NAS: TBF
tc qdisc add dev "$IF1" parent 20:30 handle 230: tbf rate 200mbit burst 128kbit latency 50ms # NAS
# DSCP EF = 46 -> TOS 0xb8
tc filter add dev "$IF1" protocol ip parent 20: prio 1 u32 \
  match ip dsfield 0xb8 0xfc flowid 20:10

# NAS: limite 200mbit
tc filter add dev "$IF1" protocol ip parent 20: prio 3 u32 \
  match ip dst ${NAS_IP}/32 flowid 20:30

#######################################
# ITF3
# Interconnexion sites 50% (prio 0)
# Accès distants / VPN 40% (prio 1, CAKE)
#######################################
tc qdisc add dev "$IF2" root handle 30: htb default 399 r2q 10000
tc class add dev "$IF2" parent 30: classid 30:1 htb rate ${ITF3_BW}mbit ceil ${ITF3_BW}mbit

tc class add dev "$IF2" parent 30:1 classid 30:10 htb rate 500mbit ceil 500mbit prio 0
tc class add dev "$IF2" parent 30:1 classid 30:20 htb rate 400mbit ceil 400mbit prio 1
tc class add dev "$IF2" parent 30:1 classid 30:399 htb rate 100mbit ceil 1000mbit prio 7

tc qdisc add dev "$IF2" parent 30:20 handle 320: cake bandwidth 400mbit diffserv4 nat # Acces distants / VPN

# Interconnexion sites
tc filter add dev "$IF2" protocol ip parent 30: prio 1 u32 \
  match ip dst ${INTERSITE_SUBNET}/${INTERSITE_MASK} flowid 30:10

# Accès distants (ex: VPN + SSH)
tc filter add dev "$IF2" protocol ip parent 30: prio 2 u32 \
  match ip dport 22 0xffff flowid 30:20
tc filter add dev "$IF2" protocol ip parent 30: prio 2 u32 \
  match ip dport 1194 0xffff flowid 30:20
tc filter add dev "$IF2" protocol ip parent 30: prio 2 u32 \
  match ip dport 51820 0xffff flowid 30:20