// SOC Analyst Roadmap — Single source of truth
// Served via GET /api/roadmap

const roadmap = [
  {
    phase: 0,
    name: 'Networking — The Deep End',
    tagline: 'Learn to read the internet like a book',
    weeks: '1–3',
    level: 'Foundation',
    tasks: [
      { id: 'p0_thm_networking', phase: 0, label: 'Networking Fundamentals', type: 'thm' },
      { id: 'p0_thm_lan', phase: 0, label: 'Intro to LAN', type: 'thm' },
      { id: 'p0_thm_osi', phase: 0, label: 'OSI Model', type: 'thm' },
      { id: 'p0_thm_packets', phase: 0, label: 'Packets & Frames', type: 'thm' },
      { id: 'p0_thm_dns', phase: 0, label: 'DNS in Detail', type: 'thm' },
      { id: 'p0_thm_http', phase: 0, label: 'HTTP in Detail', type: 'thm' },
      { id: 'p0_thm_wireshark_basics', phase: 0, label: 'Wireshark: The Basics', type: 'thm' },
      { id: 'p0_thm_wireshark_ops', phase: 0, label: 'Wireshark: Packet Operations', type: 'thm' },
      { id: 'p0_thm_tcpdump', phase: 0, label: 'Tcpdump: The Basics', type: 'thm' },
      { id: 'p0_lab_wireshark_capture', phase: 0, label: 'Wireshark Capture — Own Traffic Analysis', type: 'lab' },
      { id: 'p0_lab_dig_trace', phase: 0, label: 'DNS Deep Dive — dig +trace', type: 'lab' },
      { id: 'p0_lab_homelab_setup', phase: 0, label: 'Home Lab Setup — 2 VMs', type: 'lab' },
      { id: 'p0_lab_pcap_attack_analysis', phase: 0, label: 'PCAP Attack Analysis', type: 'lab' },
    ]
  },
  {
    phase: 1,
    name: 'Linux for SOC',
    tagline: 'Your primary weapon in the SOC',
    weeks: '3–4',
    level: 'Foundation',
    tasks: [
      { id: 'p1_thm_linux_strength', phase: 1, label: 'Linux Strength Training', type: 'thm' },
      { id: 'p1_thm_bash', phase: 1, label: 'Bash Scripting', type: 'thm' },
      { id: 'p1_thm_regex', phase: 1, label: 'Regular Expressions', type: 'thm' },
      { id: 'p1_lab_log_parser_script', phase: 1, label: 'Build a Log Parser Script', type: 'lab' },
      { id: 'p1_lab_passwd_monitor_script', phase: 1, label: 'Build a passwd Monitor Script', type: 'lab' },
    ]
  },
  {
    phase: 2,
    name: 'Security Fundamentals',
    tagline: 'The frameworks that SOC analysts live by',
    weeks: '4–6',
    level: 'Core',
    tasks: [
      { id: 'p2_thm_kill_chain', phase: 2, label: 'Cyber Kill Chain', type: 'thm' },
      { id: 'p2_thm_mitre', phase: 2, label: 'MITRE ATT&CK Framework', type: 'thm' },
      { id: 'p2_thm_diamond', phase: 2, label: 'Diamond Model', type: 'thm' },
      { id: 'p2_thm_pyramid_of_pain', phase: 2, label: 'Pyramid of Pain', type: 'thm' },
      { id: 'p2_thm_threat_intel', phase: 2, label: 'Threat Intelligence', type: 'thm' },
      { id: 'p2_concept_cia_triad', phase: 2, label: 'CIA Triad Deep Dive', type: 'concept' },
      { id: 'p2_concept_ioc_vs_ioa', phase: 2, label: 'IOC vs IOA — Know the Difference', type: 'concept' },
    ]
  },
  {
    phase: 3,
    name: 'SIEM — Your War Room',
    tagline: 'Where alerts become investigations',
    weeks: '6–10',
    level: 'Advanced',
    tasks: [
      { id: 'p3_wazuh_architecture', phase: 3, label: 'Wazuh Architecture Deep Dive', type: 'lab' },
      { id: 'p3_wazuh_custom_rules', phase: 3, label: 'Wazuh Custom Rules', type: 'lab' },
      { id: 'p3_wazuh_active_response', phase: 3, label: 'Wazuh Active Response', type: 'lab' },
      { id: 'p3_wazuh_fim', phase: 3, label: 'Wazuh File Integrity Monitoring', type: 'lab' },
      { id: 'p3_wazuh_aws_agent', phase: 3, label: 'Wazuh AWS Agent Setup', type: 'lab' },
      { id: 'p3_thm_elk_101', phase: 3, label: 'ELK 101', type: 'thm' },
      { id: 'p3_thm_splunk_basics', phase: 3, label: 'Splunk: Basics', type: 'thm' },
      { id: 'p3_thm_splunk2', phase: 3, label: 'Splunk 2', type: 'thm' },
      { id: 'p3_thm_wazuh', phase: 3, label: 'Wazuh THM Room', type: 'thm' },
      { id: 'p3_lab_synthetic_logs', phase: 3, label: 'Generate Synthetic Logs', type: 'lab' },
      { id: 'p3_lab_dashboard', phase: 3, label: 'Build a SIEM Dashboard', type: 'project' },
    ]
  },
  {
    phase: 4,
    name: 'Network IDS — The Watchtower',
    tagline: 'Detect threats on the wire in real time',
    weeks: '10–12',
    level: 'Advanced',
    tasks: [
      { id: 'p4_thm_snort', phase: 4, label: 'Snort', type: 'thm' },
      { id: 'p4_thm_snort_challenge', phase: 4, label: 'Snort Challenge', type: 'thm' },
      { id: 'p4_thm_zeek', phase: 4, label: 'Zeek', type: 'thm' },
      { id: 'p4_thm_networkminer', phase: 4, label: 'NetworkMiner', type: 'thm' },
      { id: 'p4_thm_traffic_analysis', phase: 4, label: 'Traffic Analysis', type: 'thm' },
      { id: 'p4_lab_pcap_malware_traffic', phase: 4, label: 'PCAP Malware Traffic Analysis', type: 'lab' },
    ]
  },
  {
    phase: 5,
    name: 'Incident Response',
    tagline: 'When the alarm goes off — you respond',
    weeks: '12–16',
    level: 'Advanced',
    tasks: [
      { id: 'p5_thm_ir_process', phase: 5, label: 'IR Process & Lifecycle', type: 'thm' },
      { id: 'p5_thm_phishing_1', phase: 5, label: 'Phishing Analysis 1', type: 'thm' },
      { id: 'p5_thm_phishing_2', phase: 5, label: 'Phishing Analysis 2', type: 'thm' },
      { id: 'p5_thm_windows_event_logs', phase: 5, label: 'Windows Event Logs', type: 'thm' },
      { id: 'p5_thm_volatility', phase: 5, label: 'Volatility — Memory Forensics', type: 'thm' },
      { id: 'p5_thm_autopsy', phase: 5, label: 'Autopsy — Disk Forensics', type: 'thm' },
      { id: 'p5_lab_ir_playbook_phishing', phase: 5, label: 'Write IR Playbook — Phishing', type: 'project' },
      { id: 'p5_lab_ir_playbook_bruteforce', phase: 5, label: 'Write IR Playbook — Brute Force', type: 'project' },
    ]
  },
  {
    phase: 6,
    name: 'Job Prep — Launch Sequence',
    tagline: 'Certs, portfolio, and getting hired',
    weeks: '16–24',
    level: 'Final',
    tasks: [
      { id: 'p6_cert_security_plus', phase: 6, label: 'CompTIA Security+ Study', type: 'cert' },
      { id: 'p6_cert_google_cyber', phase: 6, label: 'Google Cybersecurity Certificate', type: 'cert' },
      { id: 'p6_cert_thm_soc_l1', phase: 6, label: 'THM SOC Level 1 Path — Complete', type: 'cert' },
      { id: 'p6_project_homelab_monitor', phase: 6, label: 'Home Lab Monitoring Setup', type: 'project' },
      { id: 'p6_project_wazuh_guide', phase: 6, label: 'Write Wazuh Setup Guide', type: 'project' },
      { id: 'p6_project_detection_lab', phase: 6, label: 'Detection Lab — Full Build', type: 'project' },
      { id: 'p6_project_playbook_collection', phase: 6, label: 'IR Playbook Collection', type: 'project' },
      { id: 'p6_project_ctf_writeups', phase: 6, label: 'CTF Writeups Portfolio', type: 'project' },
    ]
  }
];

module.exports = roadmap;
