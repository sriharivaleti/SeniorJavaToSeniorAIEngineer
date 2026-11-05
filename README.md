# ⚡ The Java AI Workshop: Senior Java &rarr; Senior Java AI Engineer

> **A 20-Day Interactive 3D Spatial Masterclass for Senior Java Developers.**  
> Built with **Zero Frameworks** — Pure HTML5, CSS3, Vanilla ES Modules, Three.js, and procedural Web Audio API.  
> Deployable directly to **GitHub Pages** with 0 build steps.

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://sriharivaleti.github.io/SeniorJavaToSeniorAIEngineer/)
[![Three.js](https://img.shields.io/badge/3D%20Engine-Three.js-00f3ff?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Java](https://img.shields.io/badge/Java-21%20LTS%20%7C%2025-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring AI](https://img.shields.io/badge/AI-Spring%20AI%20%7C%20LangChain4j-green?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-ai)

---

## 🌌 Live 3D Experience

🔗 **Live Site:** [https://sriharivaleti.github.io/SeniorJavaToSeniorAIEngineer/](https://sriharivaleti.github.io/SeniorJavaToSeniorAIEngineer/)

Inspired by physical tactile engineering studios like [*Things Workshop*](https://www.things-workshop.com/), this platform replaces dry static slides with **spatial, physical-digital 3D interactive machinery**:
- **Tactile Industrial Cyber-Lab**: Dark titanium workbench, brass chamfers, and holographic emitters.
- **Procedural Web Audio API Soundscape**: Real-time synthesized relay clicks, frequency sweeps, and ambient reactor hums (0 external audio files needed).
- **Physical Concurrency & AI Simulators**: See threads, memory allocations, vector spaces, and RAG pipelines move in real 3D space.

---

## 🏛️ The 8 Core Knowledge Pillars

| Pillar | Focus | 3D Machinery |
|:---|:---|:---|
| ⚡ **1. Modern Java & Loom** | Java 8 &rarr; 25, Virtual Threads, Panama, Vector API | Concurrency Fiber Chamber & Carrier Cores |
| 🧠 **2. Deep JVM Internals** | Runtime Areas, G1/ZGC, Escape Analysis, Metaspace | Transparent 3D JVM Reactor Cube |
| 🏛️ **3. Jakarta EE & Persistence** | HikariCP, Servlets, PostgreSQL MVCC Snapshots | Liquid Pipeline & MVCC Time-Traveler |
| 🌱 **4. Spring Boot 3 & Cloud** | IoC Container, WebFlux, Micrometer Tracing | 3D Bean Holographic Wiring Grid |
| 🌐 **5. Distributed Infrastructure** | Kafka Partitions, Redis LRU, Raft Consensus | Circular Broker Ring & Conveyor Belt |
| 🌌 **6. AI Math & Transformers** | Vector Embeddings, Cosine Distance, Attention | 3D Semantic Vector Space & Attention Heatmap |
| 🤖 **7. Enterprise Spring AI** | RAG, PgVector HNSW, Function Calling, Records | RAG Ingestion & Vector Search Chamber |
| ⚔️ **8. Agents, MCP & 3D DSA** | LangChain4j, Model Context Protocol, 100+ Challenges | Autonomous Agent ReAct Loop & 3D Tree Arena |

---

## 📅 The 20-Day Interactive Roadmap

| Day | Topic | Status | 3D Interactive Deliverable |
|:---|:---|:---:|:---|
| **Day 1** | **Platform Threads vs Virtual Threads (Project Loom)** | 🚀 **LAUNCHED** | **The Loom Thread Reactor: M:N Fibers vs 1:1 OS Cylinders** |
| **Day 2** | Structured Concurrency & Scoped Values | ⏳ Upcoming | Atomic Multi-Task Coordination Chamber |
| **Day 3** | The 3D Transparent JVM Engine & GC Mechanics | ⏳ Upcoming | Real-time Eden/Survivor/Tenured 3D Memory Cube |
| **Day 4** | Pattern Matching, Records & Sealed Hierarchies | ⏳ Upcoming | 3D AST Evaluation & Exhaustive Branch Tree |
| **Day 5** | Hardware Acceleration: SIMD Vector API & Panama | ⏳ Upcoming | 512-bit AVX Register Vectorized Dot Product |
| **Day 6** | HikariCP Pool & PostgreSQL MVCC Time Travel | ⏳ Upcoming | Liquid Pipe Connection Queue & Row Version Layers |
| **Day 7** | Spring Boot 3 IoC Container & Bean Graph | ⏳ Upcoming | Holographic Dependency Laser Grid |
| **Day 8** | Spring WebFlux & Reactive Backpressure | ⏳ Upcoming | EventLoop Stream & Dynamic Backpressure Valve |
| **Day 9** | Kafka 3D Partition Ring & Consumer Rebalance | ⏳ Upcoming | Circular Broker Ring & Offset Marker Tracking |
| **Day 10** | Redis Distributed Caching & LRU Conveyor | ⏳ Upcoming | Physical 3D Eviction Conveyor & Stampede Guard |
| **Day 11** | Raft Consensus & Resilient Circuit Breakers | ⏳ Upcoming | 3D Voting Cluster, Heartbeats & Trip States |
| **Day 12** | AI Math: 3D Vector Space & Cosine Similarity | ⏳ Upcoming | High-Dimensional Embeddings Projected to 3D |
| **Day 13** | Transformers, Attention Matrix & Token Geometry | ⏳ Upcoming | Multi-Head Self-Attention 3D Heatmap |
| **Day 14** | Spring AI ChatClient & Structured Output Records | ⏳ Upcoming | Fluent Pipeline & Record-to-JSON Synthesizer |
| **Day 15** | Spring AI RAG Pipeline & PgVector HNSW Indexing | ⏳ Upcoming | Chunking & High-Dimensional Nearest Neighbors |
| **Day 16** | Spring AI Function Calling & @Tool Orchestration | ⏳ Upcoming | Autonomous LLM-to-Java Method Execution Circuit |
| **Day 17** | LangChain4j ReAct Agent Loop & ChatMemory Graph | ⏳ Upcoming | Thought &rarr; Action &rarr; Observation 3D Loop |
| **Day 18** | Model Context Protocol (MCP) in Java | ⏳ Upcoming | 3D Universal AI Client-Server Mesh |
| **Day 19** | 3D DSA Visualizer: Self-Balancing Trees & A* Search | ⏳ Upcoming | Spatial Red-Black Tree Balancing & Pathfinding |
| **Day 20** | 100+ Visual Interview Challenges & Grand Graduation | ⏳ Upcoming | The Ultimate Senior Java AI Engineer Console |

---

## ⚡ Day 1 Deep-Dive: The Loom Thread Reactor

On **Day 1**, we tackle the most profound shift in modern Java backend architecture: **Project Loom (Virtual Threads)**.

### Why It Matters:
Traditional Java architectures assign **one operating system thread per request** (`1:1` threading model). Because each OS thread costs ~1 MB of stack memory and thousands of CPU cycles to context-switch inside the OS kernel, scaling to 50,000+ concurrent connections results in either thread pool exhaustion or `java.lang.OutOfMemoryError: unable to create native thread`.

Java 21+ Project Loom introduces **Virtual Threads** (`M:N` threading model). Millions of lightweight threads run on just a few carrier OS threads (pinned to your CPU core count). When a virtual thread performs blocking I/O (e.g. database query, socket read), it automatically **unmounts** from the carrier thread and parks in heap memory (costing only a few bytes!).

```java
// Java 21+ Project Loom: High-Throughput Concurrency
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 100_000).forEach(i -> {
        executor.submit(() -> {
            // Parks without stalling the carrier OS thread!
            Thread.sleep(Duration.ofMillis(100));
            return "Task completed on " + Thread.currentThread();
        });
    });
} // Automatic structured join
```

### Try it in the 3D Workbench:
1. Toggle between **Platform Threads (1:1 OS)** and **Virtual Threads (M:N Loom)**.
2. Drag the **Concurrency Slider** up to 250,000 threads.
3. Click **"Simulate 200ms I/O Stall"** and watch the platform pistons freeze while virtual fibers continue streaming without blocking carrier cores!

---

## 🛠️ Local Development (Zero Build Steps)

Since this project uses vanilla ES Modules, you can run it immediately with any static file server:

### Option 1: Python
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000)

### Option 2: Node / npx
```bash
npx serve
```

### Option 3: VS Code Live Server
Right-click `index.html` and click **"Open with Live Server"**.

---

## 🚀 GitHub Pages Deployment

To enable GitHub Pages:
1. Push this repository to GitHub: `git push -u origin main`
2. Go to your repository **Settings** &rarr; **Pages**.
3. Under **Branch**, select `main` / `root` and click **Save**.
4. Your site will be live at `https://sriharivaleti.github.io/SeniorJavaToSeniorAIEngineer/` within 60 seconds!

---

## 🤝 Roadmap Collaboration
Created for the global Java engineering community by **Sreehari Valeti** & **Antigravity**.
Every day for the next 20 days, a new interactive 3D module will be published!

