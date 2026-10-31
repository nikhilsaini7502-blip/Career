import { TechRole } from '../types/career';

export const TECH_ROLES_TAXONOMY: TechRole[] = [
  // 1. Software Engineering
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    family: 'Software Engineering',
    demandLevel: 'Very High',
    averageSalaryRange: '$85,000 - $135,000',
    description: 'Builds responsive, high-performance web applications, UI architecture, accessibility, and client-side state management.',
    requiredSkills: ['JavaScript / TypeScript', 'React / Next.js', 'CSS / Tailwind CSS', 'HTML5 & Semantic Web', 'Git & GitHub'],
    preferredSkills: ['Performance Optimization', 'Jest / Vitest', 'State Management (Zustand/Redux)', 'REST / GraphQL APIs', 'Web Vitals'],
    certifications: ['Meta Front-End Developer', 'AWS Certified Cloud Practitioner']
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    family: 'Software Engineering',
    demandLevel: 'Very High',
    averageSalaryRange: '$95,000 - $145,000',
    description: 'Designs reliable REST/gRPC microservices, server architectures, database modeling, and authentication systems.',
    requiredSkills: ['Node.js / Express', 'TypeScript / Go / Python', 'SQL (PostgreSQL)', 'RESTful API Design', 'Docker & Containers'],
    preferredSkills: ['Redis Caching', 'Kafka / RabbitMQ', 'GraphQL', 'System Architecture', 'CI/CD Pipelines'],
    certifications: ['AWS Certified Solutions Architect', 'Docker Certified Associate']
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    family: 'Software Engineering',
    demandLevel: 'Very High',
    averageSalaryRange: '$100,000 - $155,000',
    description: 'Bridges frontend interfaces and backend infrastructure, delivering cohesive end-to-end web products.',
    requiredSkills: ['React / TypeScript', 'Node.js / Express', 'PostgreSQL / MongoDB', 'API Integration', 'Git & CI/CD'],
    preferredSkills: ['Next.js App Router', 'Tailwind CSS', 'Docker', 'Cloud Deployment (AWS/Cloud Run)', 'Automated Testing'],
    certifications: ['Full Stack Open Certificate', 'AWS Certified Developer']
  },
  {
    id: 'mobile-app-developer',
    title: 'Mobile App Developer',
    family: 'Software Engineering',
    demandLevel: 'High',
    averageSalaryRange: '$90,000 - $140,000',
    description: 'Engineers native and cross-platform mobile apps for iOS and Android with intuitive tactile experiences.',
    requiredSkills: ['React Native / Flutter / Swift / Kotlin', 'Mobile UI Design', 'REST APIs', 'State Management', 'App Store Guidelines'],
    preferredSkills: ['Offline Data Sync', 'Push Notifications', 'Native Modules', 'Mobile CI/CD (Fastlane)', 'Firebase Mobile SDK'],
    certifications: ['Google Associate Android Developer', 'Apple Certified iOS Developer']
  },
  {
    id: 'systems-engineer',
    title: 'Systems Engineer',
    family: 'Software Engineering',
    demandLevel: 'High',
    averageSalaryRange: '$110,000 - $165,000',
    description: 'Develops low-level systems, kernel modules, high-throughput network daemons, and embedded software.',
    requiredSkills: ['C / C++', 'Rust', 'Linux Internals & POSIX', 'Memory Management', 'Multithreading & Concurrency'],
    preferredSkills: ['Assembly', 'Network Protocols (TCP/UDP)', 'Device Drivers', 'Performance Profiling (perf, gdb)', 'eBPF'],
    certifications: ['Linux Professional Institute LPIC-2', 'Certified Rust Professional']
  },

  // 2. Artificial Intelligence and Machine Learning
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    family: 'Artificial Intelligence & ML',
    demandLevel: 'Very High',
    averageSalaryRange: '$120,000 - $185,000',
    description: 'Implements production AI solutions integrating LLMs, multimodal models, vector retrieval, and agent workflows.',
    requiredSkills: ['Python', 'LLM Prompt Engineering', 'LangChain / LangGraph', 'Vector Databases (Pinecone/Chroma)', 'REST API Integration'],
    preferredSkills: ['Fine-Tuning (LoRA)', 'RAG Architecture', 'Model Evaluation & Guardrails', 'PyTorch Basics', 'Docker'],
    certifications: ['Google Cloud Professional Machine Learning Engineer', 'DeepLearning.AI Generative AI for Everyone']
  },
  {
    id: 'ml-engineer',
    title: 'ML Engineer',
    family: 'Artificial Intelligence & ML',
    demandLevel: 'Very High',
    averageSalaryRange: '$125,000 - $190,000',
    description: 'Designs, trains, evaluates, and deploys scalable machine learning models into production workflows.',
    requiredSkills: ['Python', 'PyTorch / TensorFlow', 'Scikit-Learn & Pandas', 'Feature Engineering', 'Model Deployment (FastAPI/Triton)'],
    preferredSkills: ['MLOps (MLflow, Kubeflow)', 'Distributed Training', 'Docker & Kubernetes', 'Hyperparameter Tuning', 'ONNX Runtime'],
    certifications: ['AWS Certified Machine Learning - Specialty', 'Google Professional ML Engineer']
  },
  {
    id: 'generative-ai-engineer',
    title: 'Generative AI Engineer',
    family: 'Artificial Intelligence & ML',
    demandLevel: 'Very High',
    averageSalaryRange: '$130,000 - $195,000',
    description: 'Specializes in autonomous agent systems, multi-modal synthesis, embedding models, and generative pipelines.',
    requiredSkills: ['Python / TypeScript', 'Gemini / OpenAI API SDKs', 'Agentic Workflows (StateGraph/Tools)', 'Embedding Models & RAG', 'Guardrail Systems'],
    preferredSkills: ['Context Caching & Streaming', 'Function Calling', 'Evaluation Frameworks (Ragas)', 'Multimodal Audio/Vision', 'vLLM'],
    certifications: ['Google Generative AI Leader', 'Vanderbilt Prompt Engineering Specialization']
  },
  {
    id: 'nlp-engineer',
    title: 'NLP Engineer',
    family: 'Artificial Intelligence & ML',
    demandLevel: 'High',
    averageSalaryRange: '$115,000 - $175,000',
    description: 'Builds systems for textual comprehension, classification, sentiment analysis, translation, and tokenization.',
    requiredSkills: ['Python', 'Hugging Face Transformers', 'NLTK / spaCy', 'Tokenization & Embeddings', 'PyTorch'],
    preferredSkills: ['Seq2Seq Models', 'Information Extraction', 'NER & Relation Extraction', 'Text Generation Benchmarking', 'Semantic Search'],
    certifications: ['DeepLearning.AI Natural Language Processing Specialization']
  },
  {
    id: 'computer-vision-engineer',
    title: 'Computer Vision Engineer',
    family: 'Artificial Intelligence & ML',
    demandLevel: 'High',
    averageSalaryRange: '$120,000 - $180,000',
    description: 'Develops visual perception models for object detection, segmentation, optical character recognition, and video tracking.',
    requiredSkills: ['Python', 'OpenCV', 'PyTorch', 'CNNs & Vision Transformers (ViT)', 'Object Detection (YOLO/Faster-RCNN)'],
    preferredSkills: ['Image Segmentation', '3D Vision & Point Clouds', 'Edge AI (TensorRT, CoreML)', 'Video Stream Processing', 'Data Augmentation'],
    certifications: ['NVIDIA Deep Learning Institute Certificate']
  },

  // 3. Data and Analytics
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    family: 'Data & Analytics',
    demandLevel: 'Very High',
    averageSalaryRange: '$75,000 - $115,000',
    description: 'Translates raw enterprise data into actionable business intelligence through dashboards, queries, and reports.',
    requiredSkills: ['SQL (Complex Joins & Windows)', 'Excel & Advanced Spreadsheets', 'Tableau / PowerBI', 'Exploratory Data Analysis', 'Data Storytelling'],
    preferredSkills: ['Python (Pandas / Seaborn)', 'Statistical Analysis', 'A/B Testing Frameworks', 'Google BigQuery', 'Business Acumen'],
    certifications: ['Google Data Analytics Professional Certificate', 'Microsoft Certified: Power BI Data Analyst']
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    family: 'Data & Analytics',
    demandLevel: 'High',
    averageSalaryRange: '$110,000 - $165,000',
    description: 'Applies statistical rigor, hypothesis testing, predictive modeling, and machine learning to solve strategic business challenges.',
    requiredSkills: ['Python / R', 'Advanced SQL', 'Probability & Statistics', 'Machine Learning Algorithms', 'Pandas & NumPy'],
    preferredSkills: ['Experimentation & Causal Inference', 'BigQuery / Snowflake', 'Data Storytelling', 'Feature Stores', 'Deep Learning Basics'],
    certifications: ['IBM Data Science Professional', 'HarvardX Data Science Certificate']
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    family: 'Data & Analytics',
    demandLevel: 'Very High',
    averageSalaryRange: '$115,000 - $170,000',
    description: 'Architects robust ETL/ELT pipelines, data lakes, distributed storage, and streaming infrastructure.',
    requiredSkills: ['SQL & Data Modeling', 'Python', 'Apache Spark / PySpark', 'Data Warehouses (Snowflake / BigQuery)', 'Airflow / Dagster'],
    preferredSkills: ['Kafka Streaming', 'dbt (data build tool)', 'Data Quality Frameworks', 'AWS S3 / GCP Storage', 'Parquet / Delta Lake'],
    certifications: ['Google Cloud Professional Data Engineer', 'Databricks Certified Data Engineer Associate']
  },
  {
    id: 'analytics-engineer',
    title: 'Analytics Engineer',
    family: 'Data & Analytics',
    demandLevel: 'High',
    averageSalaryRange: '$105,000 - $155,000',
    description: 'Sits at the intersection of data engineering and business analysis, transforming data using software engineering best practices.',
    requiredSkills: ['Advanced SQL', 'dbt (Data Modeling)', 'Cloud Data Warehouses (Snowflake/BigQuery)', 'Git for Data', 'Data Documentation'],
    preferredSkills: ['Python for Data', 'Looker / Metabase Modeling', 'CI/CD for Data', 'Data Testing (Great Expectations)', 'Business Metrics Design'],
    certifications: ['dbt Certified Developer', 'Snowflake SnowPro Core']
  },
  {
    id: 'bi-developer',
    title: 'Business Intelligence Developer',
    family: 'Data & Analytics',
    demandLevel: 'High',
    averageSalaryRange: '$85,000 - $130,000',
    description: 'Designs enterprise reporting solutions, interactive dashboards, DAX queries, and dimensional data models.',
    requiredSkills: ['Power BI / Tableau', 'SQL Query Optimization', 'DAX / Power Query', 'Star Schema & Dimensional Modeling', 'KPI Dashboard Design'],
    preferredSkills: ['ETL Automation', 'SSIS / SSRS', 'Python Scripting', 'Data Governance', 'Executive Presentation'],
    certifications: ['Microsoft Certified: Power BI Data Analyst Associate']
  },

  // 4. Cloud and DevOps
  {
    id: 'cloud-engineer',
    title: 'Cloud Engineer',
    family: 'Cloud & DevOps',
    demandLevel: 'Very High',
    averageSalaryRange: '$105,000 - $160,000',
    description: 'Designs, deploys, and maintains cloud infrastructure across AWS, GCP, or Azure with high availability and security.',
    requiredSkills: ['AWS / GCP / Azure Core Services', 'Linux Administration', 'Networking (VPC, DNS, Subnets)', 'Terraform (IaC)', 'Docker'],
    preferredSkills: ['Cloud Security (IAM, KMS)', 'Serverless (Lambda/Cloud Run)', 'Cost Optimization (FinOps)', 'Monitoring (CloudWatch)', 'Python Scripting'],
    certifications: ['AWS Solutions Architect Associate', 'Google Cloud Associate Cloud Engineer']
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    family: 'Cloud & DevOps',
    demandLevel: 'Very High',
    averageSalaryRange: '$115,000 - $170,000',
    description: 'Builds automated CI/CD deployment pipelines, container orchestration, and seamless release workflows.',
    requiredSkills: ['CI/CD (GitHub Actions / GitLab)', 'Docker & Kubernetes', 'Terraform', 'Linux & Bash Scripting', 'Git Version Control'],
    preferredSkills: ['Helm Charts', 'ArgoCD / GitOps', 'Ansible', 'Prometheus & Grafana', 'Secret Management (Vault)'],
    certifications: ['Certified Kubernetes Administrator (CKA)', 'AWS Certified DevOps Engineer']
  },
  {
    id: 'site-reliability-engineer',
    title: 'Site Reliability Engineer (SRE)',
    family: 'Cloud & DevOps',
    demandLevel: 'Very High',
    averageSalaryRange: '$125,000 - $180,000',
    description: 'Applies software engineering principles to operations, managing uptime, SLIs/SLOs, incident response, and chaos engineering.',
    requiredSkills: ['Linux & Systems Internals', 'Python / Go Automation', 'Kubernetes', 'SLI/SLO/Error Budgets', 'Prometheus & Alerting'],
    preferredSkills: ['Incident Post-Mortems', 'Chaos Engineering', 'Distributed Tracing (OpenTelemetry)', 'High Availability Architecture', 'Networking'],
    certifications: ['Google Cloud Professional Cloud DevOps Engineer', 'CKA']
  },
  {
    id: 'platform-engineer',
    title: 'Platform Engineer',
    family: 'Cloud & DevOps',
    demandLevel: 'High',
    averageSalaryRange: '$125,000 - $185,000',
    description: 'Builds internal developer platforms (IDP) to empower product teams to deploy and operate applications friction-free.',
    requiredSkills: ['Kubernetes & CRDs', 'Terraform / Pulumi', 'Developer Tooling & CLI Design', 'Go / Python', 'CI/CD Frameworks'],
    preferredSkills: ['Backstage (Spotify IDP)', 'Crossplane', 'Service Mesh (Istio)', 'Developer Experience (DevEx) Metrics', 'Cloud Architecture'],
    certifications: ['CKA', 'AWS Solutions Architect Professional']
  },

  // 5. Cybersecurity
  {
    id: 'security-analyst',
    title: 'Security Analyst',
    family: 'Cybersecurity',
    demandLevel: 'Very High',
    averageSalaryRange: '$85,000 - $130,000',
    description: 'Monitors corporate networks for security breaches, investigates cyber incidents, and installs proactive safeguards.',
    requiredSkills: ['Network Security & Protocols', 'SIEM Tools (Splunk / Elastic)', 'Incident Response Protocols', 'Vulnerability Assessment', 'Firewalls & IDS/IPS'],
    preferredSkills: ['Threat Hunting', 'Log Analysis', 'Wireshark Packet Analysis', 'Python / Bash Scripting', 'Compliance Frameworks (NIST, ISO 27001)'],
    certifications: ['CompTIA Security+', 'GIAC Certified Incident Handler (GCIH)']
  },
  {
    id: 'soc-analyst',
    title: 'SOC Analyst',
    family: 'Cybersecurity',
    demandLevel: 'High',
    averageSalaryRange: '$80,000 - $125,000',
    description: 'Acts as first line of defense in a 24/7 Security Operations Center, triaging alerts and neutralizing intrusions.',
    requiredSkills: ['SIEM Alert Triage', 'Log Analysis & Correlating Events', 'Phishing & Malware Analysis Basics', 'MITRE ATT&CK Framework', 'Networking (TCP/IP)'],
    preferredSkills: ['SOAR Automation', 'EDR Tools (CrowdStrike/Defender)', 'Memory Forensics Basics', 'Cyber Threat Intelligence', 'Bash / PowerShell'],
    certifications: ['CompTIA CySA+', 'Certified SOC Analyst (CSA)']
  },
  {
    id: 'penetration-tester',
    title: 'Penetration Tester (Ethical Hacker)',
    family: 'Cybersecurity',
    demandLevel: 'High',
    averageSalaryRange: '$100,000 - $160,000',
    description: 'Simulates cyberattacks to uncover vulnerabilities in web applications, network endpoints, and cloud infrastructure.',
    requiredSkills: ['OWASP Top 10 Web Vulnerabilities', 'Burp Suite / Kali Linux', 'Network Exploitation', 'Python / Scripting', 'Technical Report Writing'],
    preferredSkills: ['Active Directory Attacks', 'Binary Exploitation / Reverse Engineering', 'API Security Testing', 'Cloud Penetration Testing', 'Privilege Escalation'],
    certifications: ['Offensive Security Certified Professional (OSCP)', 'CompTIA PenTest+']
  },
  {
    id: 'security-engineer',
    title: 'Security Engineer',
    family: 'Cybersecurity',
    demandLevel: 'Very High',
    averageSalaryRange: '$115,000 - $175,000',
    description: 'Designs, implements, and audits defense-in-depth security architectures across software, cloud, and corporate environments.',
    requiredSkills: ['Cloud Security (AWS/GCP IAM & Policies)', 'Cryptography Fundamentals', 'DevSecOps & SAST/DAST', 'Identity & Access Management (IAM)', 'Python / Go'],
    preferredSkills: ['Container Security (Trivy/Falco)', 'Zero Trust Architecture', 'Threat Modeling (STRIDE)', 'Infrastructure as Code Security', 'Security Automation'],
    certifications: ['Certified Information Systems Security Professional (CISSP)', 'AWS Certified Security - Specialty']
  },

  // 6. Software Testing
  {
    id: 'qa-engineer',
    title: 'QA Engineer',
    family: 'Software Testing',
    demandLevel: 'High',
    averageSalaryRange: '$75,000 - $115,000',
    description: 'Ensures software quality through comprehensive test planning, exploratory testing, regression cycles, and bug tracking.',
    requiredSkills: ['Test Plan & Strategy Design', 'Manual & Exploratory Testing', 'Bug Tracking (Jira)', 'API Testing (Postman)', 'Basic SQL Queries'],
    preferredSkills: ['Test Automation Basics', 'Agile / Scrum Methodologies', 'Performance Testing Basics', 'Browser DevTools Inspection', 'Test Case Management'],
    certifications: ['ISTQB Foundation Level']
  },
  {
    id: 'automation-tester',
    title: 'Automation Tester',
    family: 'Software Testing',
    demandLevel: 'High',
    averageSalaryRange: '$90,000 - $135,000',
    description: 'Writes maintainable test suites automating UI and API workflows to accelerate regression and release verification.',
    requiredSkills: ['Playwright / Cypress / Selenium', 'TypeScript / JavaScript / Python', 'Page Object Model (POM)', 'API Test Automation', 'Git & CI/CD Integration'],
    preferredSkills: ['BDD Frameworks (Cucumber)', 'Cross-Browser Grid Testing', 'Docker for Test Environments', 'Reporting (Allure)', 'Mocking Services'],
    certifications: ['ISTQB Test Automation Engineer']
  },
  {
    id: 'sdet',
    title: 'Software Development Engineer in Test (SDET)',
    family: 'Software Testing',
    demandLevel: 'Very High',
    averageSalaryRange: '$105,000 - $160,000',
    description: 'A developer focused on test engineering, architecting enterprise testing infrastructure, mock services, and pipeline gates.',
    requiredSkills: ['Strong Programming (TypeScript/Java/Python)', 'Test Infrastructure Architecture', 'CI/CD Pipeline Gates', 'Mocking & Contract Testing (Pact)', 'Performance Testing (k6/JMeter)'],
    preferredSkills: ['Distributed Testing Grids', 'Static Analysis & Code Coverage Tools', 'Chaos Testing', 'Cloud Environments', 'Containerization'],
    certifications: ['ISTQB Advanced Level Technical Test Analyst']
  },

  // 7. Product and Design
  {
    id: 'product-manager',
    title: 'Product Manager',
    family: 'Product & Design',
    demandLevel: 'High',
    averageSalaryRange: '$100,000 - $160,000',
    description: 'Identifies customer needs, establishes product roadmaps, prioritizes feature backlogs, and aligns engineering with business goals.',
    requiredSkills: ['Product Strategy & Roadmapping', 'User Research & Discovery', 'Agile / Scrum Leadership', 'Data-Informed Decision Making', 'PRD Writing & Wireframing'],
    preferredSkills: ['A/B Testing & Analytics (Mixpanel/Amplitude)', 'Technical Communication', 'Competitive Analysis', 'Financial Modeling Basics', 'GTM Strategy'],
    certifications: ['Product School Certified Product Manager (CPM)', 'Pragmatic Institute Certified']
  },
  {
    id: 'technical-product-manager',
    title: 'Technical Product Manager',
    family: 'Product & Design',
    demandLevel: 'Very High',
    averageSalaryRange: '$115,000 - $175,000',
    description: 'Leads complex technical platforms, APIs, developer tools, and infrastructure products with deep engineering fluency.',
    requiredSkills: ['API & System Architecture Fluency', 'Technical PRD Specification', 'Engineering Backlog Prioritization', 'Data Modeling Basics', 'Developer Experience (DevEx)'],
    preferredSkills: ['SQL for Deep Dive Queries', 'Microservices Understanding', 'Cloud Architecture Awareness', 'SDK & API Design Principles', 'Cross-Functional Leadership'],
    certifications: ['Scrum Alliance Certified Scrum Product Owner (CSPO)']
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    family: 'Product & Design',
    demandLevel: 'High',
    averageSalaryRange: '$85,000 - $135,000',
    description: 'Crafts visually refined interfaces, user journeys, wireframes, and design systems with obsessive detail to interaction.',
    requiredSkills: ['Figma Mastery & Component Systems', 'Wireframing & Prototyping', 'User Research & Usability Testing', 'Visual Design & Typography', 'Responsive Layout Principles'],
    preferredSkills: ['Design Systems Documentation', 'Interaction Design & Micro-animations', 'Accessibility (WCAG 2.1)', 'Basic HTML/CSS Fluency', 'Design Tokens'],
    certifications: ['Google UX Design Professional Certificate']
  },

  // 8. IT and Infrastructure
  {
    id: 'network-engineer',
    title: 'Network Engineer',
    family: 'IT & Infrastructure',
    demandLevel: 'High',
    averageSalaryRange: '$85,000 - $135,000',
    description: 'Designs, configures, and secures LAN/WAN architectures, routers, switches, VPNs, and network monitoring systems.',
    requiredSkills: ['TCP/IP, BGP, OSPF Protocols', 'Cisco / Juniper Hardware Configuration', 'VLANs, Subnetting, Routing', 'Network Security & Firewalls', 'Packet Analysis (Wireshark)'],
    preferredSkills: ['Network Automation (Python / Ansible)', 'SD-WAN Technology', 'Cloud Networking (AWS VPC / DirectConnect)', 'DNS / DHCP Management', 'Load Balancers (F5/HAProxy)'],
    certifications: ['Cisco Certified Network Associate (CCNA)', 'CCNP Enterprise']
  },
  {
    id: 'system-administrator',
    title: 'System Administrator',
    family: 'IT & Infrastructure',
    demandLevel: 'Moderate',
    averageSalaryRange: '$75,000 - $115,000',
    description: 'Maintains enterprise servers, Active Directory, virtualization clusters, user access, and automated backup operations.',
    requiredSkills: ['Linux & Windows Server Administration', 'Active Directory & Group Policy', 'Virtualization (VMware / Hyper-V)', 'Bash / PowerShell Scripting', 'Backup & Disaster Recovery'],
    preferredSkills: ['Storage Area Networks (SAN/NAS)', 'Patch Management Systems', 'Cloud Migration Basics', 'SSO / SAML Configuration', 'Monitoring (Nagios/Zabbix)'],
    certifications: ['Red Hat Certified System Administrator (RHCSA)', 'CompTIA Server+']
  },
  {
    id: 'it-support-engineer',
    title: 'IT Support Engineer',
    family: 'IT & Infrastructure',
    demandLevel: 'Moderate',
    averageSalaryRange: '$55,000 - $85,000',
    description: 'Provides technical support for hardware, OS installations, endpoint security, peripherals, and network connectivity.',
    requiredSkills: ['Hardware & OS Troubleshooting (Win/Mac/Linux)', 'Ticketing Systems (ServiceNow/Zendesk)', 'Network Diagnostics (ping, traceroute)', 'Endpoint Management (MDM/Intune)', 'Customer Service & Communication'],
    preferredSkills: ['PowerShell Automation', 'Google Workspace / M365 Administration', 'VoIP Setup', 'Asset Tracking', 'Documentation'],
    certifications: ['CompTIA A+', 'Google IT Support Professional Certificate']
  },
  {
    id: 'infrastructure-engineer',
    title: 'Infrastructure Engineer',
    family: 'IT & Infrastructure',
    demandLevel: 'High',
    averageSalaryRange: '$105,000 - $160,000',
    description: 'Engineers hybrid on-premise and cloud infrastructure, compute clusters, high-speed storage, and disaster recovery architectures.',
    requiredSkills: ['Hybrid Cloud Architecture', 'Linux Enterprise Administration', 'Infrastructure as Code (Terraform)', 'Storage & SAN Architecture', 'Monitoring & Telemetry'],
    preferredSkills: ['Kubernetes Infrastructure', 'Data Center Operations', 'High-Bandwidth Networking', 'Disaster Recovery Simulation', 'Hardware Acceleration (GPUs)'],
    certifications: ['RHCE (Red Hat Certified Engineer)', 'AWS Solutions Architect Associate']
  }
];

export const CAREER_FAMILIES = Array.from(new Set(TECH_ROLES_TAXONOMY.map(r => r.family)));

export function findRoleById(roleId: string): TechRole | undefined {
  return TECH_ROLES_TAXONOMY.find(r => r.id === roleId);
}
