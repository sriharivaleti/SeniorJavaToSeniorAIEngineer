/**
 * Topic and Subtopic Knowledge Base
 * Structured for Senior Java Developers -> Senior Java AI Engineers.
 * Explanations written in crystal-clear, simple English with strong mental models.
 */

export const TOPICS = [
  {
    id: 'core-java',
    name: 'Core Java & JVM',
    icon: '⚡',
    badge: 'ACTIVE TODAY',
    summary: 'Master the JVM runtime, memory mechanics, modern concurrency with Loom, and cutting-edge Java 17-25 features.',
    subtopics: [
      {
        id: 'virtual-threads',
        title: 'Project Loom: Virtual Threads vs Platform Threads',
        simpleTitle: 'Lightweight Courier Drones vs Heavy Semi-Trucks',
        tag: 'Java 21+ Concurrency',
        sceneType: 'loom',
        summary: 'How Java 21 eliminated thread starvation by decoupling Java threads from heavy Operating System kernel threads.',
        mentalModel: `Think of traditional Platform Threads as heavy 18-wheeler semi-trucks: each requires a dedicated lane (1MB OS stack memory) and an expensive highway driver. If you launch 10,000 trucks, the highway immediately gridlocks.
        
Virtual Threads are like lightweight courier drones: you can launch 1,000,000 of them. Whenever a drone waits for a package (I/O, database, network), it immediately steps aside and lets another drone use the flight path.`,
        howItWorks: [
          'Platform Threads (1:1 model): 1 Java Thread = 1 OS Kernel Thread (~1 MB memory stack, expensive OS context switches).',
          'Virtual Threads (M:N model): Millions of virtual threads run on just a few Carrier Threads (usually equal to your CPU cores).',
          'Non-blocking I/O Magic: When a virtual thread calls Thread.sleep(), executes a database query, or reads a socket, the JVM unmounts it from the carrier thread and parks it in cheap heap memory (~few hundred bytes).',
          'Carrier Thread Freedom: The OS carrier thread immediately picks up another ready virtual thread without any OS kernel trap!'
        ],
        seniorTakeaways: [
          'Never pool Virtual Threads! With platform threads, Executors.newFixedThreadPool(200) was essential. With Virtual Threads, use Executors.newVirtualThreadPerTaskExecutor() and create one thread per task.',
          'Watch out for ThreadLocal leaks: because virtual threads are ephemeral and millions can exist, storing large objects in ThreadLocal will bloat your heap. Use Scoped Values instead.',
          'Beware of Pinning: If a virtual thread enters a synchronized block or calls native C code (JNI), it gets "pinned" to its carrier thread and cannot unmount during blocking I/O. Replace synchronized with ReentrantLock.'
        ],
        javaCode: `// Traditional Thread Pool (Bottleneck under I/O load)
// ExecutorService executor = Executors.newFixedThreadPool(200);

// Modern Java 21+ Project Loom: High-Throughput Concurrency
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        final int taskId = i;
        executor.submit(() -> {
            // Simulated 100ms Database / REST Call:
            // Virtual thread unmounts from carrier thread during sleep!
            Thread.sleep(Duration.ofMillis(100));
            return "Task " + taskId + " executed on " + Thread.currentThread();
        });
    }
} // AutoCloseable executor: automatically awaits all tasks at scope exit!`
      },
      {
        id: 'jvm-memory',
        title: 'JVM Memory Architecture & GC Physics',
        simpleTitle: 'The Transparent JVM Engine: Heap, Stacks & Garbage Collection',
        tag: 'JVM Internals',
        sceneType: 'jvm-memory',
        summary: 'Visualizing where your objects live: Eden, Survivor, Tenured (Old Gen), Metaspace, and how Garbage Collectors clean up.',
        mentalModel: `Think of JVM memory as a recycling facility with different conveyor zones.
        
95% of Java objects die young (local method variables, DTOs). They are born in the "Eden nursery". Surviving objects get promoted to "Survivor zones", and if they survive multiple cleaning cycles, they get moved to the "Tenured warehouse" (long-lived singletons, caches). Metaspace holds class blueprints outside the heap.`,
        howItWorks: [
          'Eden Space (Young Gen): Where new objects (new MyObject()) are born at lightning speed using bump-the-pointer.',
          'Survivor Spaces (S0 / S1): Objects that survive Minor GC move back and forth between S0 and S1 with an age counter.',
          'Tenured / Old Gen: Long-lived objects (e.g. Spring beans, static caches) promoted after reaching the aging threshold (tenuring threshold).',
          'Metaspace: Native memory holding Class metadata, method bytecodes, and constant pools (replaces PermGen since Java 8).',
          'Thread Stacks: Independent private memory per thread storing stack frames, primitive local variables, and object references.'
        ],
        seniorTakeaways: [
          'Stop-the-World pauses happen when GC must pause all application threads to mark or compact pointers.',
          'Modern collectors like ZGC and Shenandoah perform concurrent marking and relocation with sub-millisecond pauses even on multi-terabyte heaps.',
          'Escape Analysis: If JIT detects that an object created in a method never escapes that method, it optimizes it onto the thread stack or scalar-replaces it, avoiding heap allocation entirely!'
        ],
        javaCode: `// Object Lifecycle & Escape Analysis in Java
public class MemoryDemo {
    // Escaping object -> Promoted to Eden Heap -> eventually Old Gen
    private static final Map<String, CacheEntry> CACHE = new ConcurrentHashMap<>();

    public void processTransaction(String id) {
        // Non-escaping object: JIT Escape Analysis allocates this on Stack!
        // Never triggers GC because it disappears when method returns.
        Point localPoint = new Point(10, 20);

        // Escaping object: Put into static cache, lives in Heap / Tenured!
        CACHE.put(id, new CacheEntry(id, System.currentTimeMillis()));
    }
}`
      },
      {
        id: 'concurrency-locks',
        title: 'Concurrency Locks: ReentrantLock vs Synchronized',
        simpleTitle: 'Fair Gates vs Heavy Turnstiles: Thread Coordination in 3D',
        tag: 'Multi-threading',
        sceneType: 'locks',
        summary: 'How threads compete for shared resources, why virtual threads hate synchronized, and how ReentrantLock prevents thread pinning.',
        mentalModel: `Think of a lock as a security turnstile protecting a VIP vault.
        
Synchronized is an old mechanical gate: if a thread gets stuck inside talking on the phone (blocking I/O), the entire lane is blocked and the OS carrier thread is pinned.
ReentrantLock is an electronic badge system: threads can try to enter with timeouts (tryLock), interrupt waiting threads, and virtual threads can gracefully unmount while waiting.`,
        howItWorks: [
          'Synchronized (JVM Monitor): Built into Java object headers (Mark Word). Uses biased locking -> lightweight CAS locking -> heavyweight OS mutex.',
          'ReentrantLock (AQS - AbstractQueuedSynchronizer): Java-level lock with FIFO wait queue, support for fairness, interruptible acquisition, and condition variables.',
          'Loom Pinning Rule: Synchronized blocks pin Virtual Threads to their OS carrier thread. ReentrantLock does NOT pin Virtual Threads!'
        ],
        seniorTakeaways: [
          'In Java 21+, replace synchronized with ReentrantLock across your libraries to ensure Virtual Threads are never pinned during I/O.',
          'Always use the try-finally pattern with ReentrantLock to prevent deadlocks: lock.lock(); try { ... } finally { lock.unlock(); }',
          'Use tryLock(timeout, unit) to prevent cascading system deadlocks under heavy load.'
        ],
        javaCode: `// Recommended Pattern for High-Throughput Java 21+ Services
public class SafeCounter {
    private final ReentrantLock lock = new ReentrantLock(true); // Optional Fair lock
    private int count = 0;

    public void incrementWithVirtualThreadSafety() {
        lock.lock(); // Virtual thread friendly! Does NOT pin carrier thread.
        try {
            count++;
        } finally {
            lock.unlock(); // Always release in finally block!
        }
    }

    public boolean tryUpdateWithTimeout() throws InterruptedException {
        // Prevents deadlocks under system congestion
        if (lock.tryLock(500, TimeUnit.MILLISECONDS)) {
            try {
                return true;
            } finally {
                lock.unlock();
            }
        }
        return false; // Handled gracefully without blocking forever
    }
}`
      }
    ]
  },
  {
    id: 'java-ee',
    name: 'Jakarta EE & Persistence',
    icon: '🏛️',
    badge: 'COMING UP',
    summary: 'HikariCP connection pool mechanics, Servlet 6 filter chains, and PostgreSQL MVCC transaction isolation.',
    subtopics: [
      {
        id: 'hikaricp-pooling',
        title: 'HikariCP Connection Pool Dynamics',
        simpleTitle: 'Liquid Pipes: Borrowing & Returning Database Connections',
        tag: 'JDBC & Databases',
        sceneType: 'loom',
        summary: 'Why HikariCP outperforms all other connection pools using byte-level bytecode optimization and lock-free concurrency.'
      }
    ]
  },
  {
    id: 'spring-cloud',
    name: 'Spring Boot 3 & Microservices',
    icon: '🌱',
    badge: 'COMING UP',
    summary: 'Spring 3 IoC container, bean dependency wiring, and WebFlux reactive backpressure streams.',
    subtopics: [
      {
        id: 'spring-ioc-grid',
        title: 'Spring 3 IoC Container & Bean Graph',
        simpleTitle: 'The Holographic Laser Grid: How Beans Get Wired',
        tag: 'Spring Core',
        sceneType: 'loom',
        summary: 'Visualizing bean creation order, circular dependencies, and AOP proxies.'
      }
    ]
  },
  {
    id: 'system-design',
    name: 'System Design & Distributed',
    icon: '🌐',
    badge: 'COMING UP',
    summary: 'Kafka partition rings, Redis distributed caching, and Raft consensus algorithms.',
    subtopics: [
      {
        id: 'kafka-partitions',
        title: 'Kafka 3D Partition Ring & Offsets',
        simpleTitle: 'The Message Turntable: Producers, Partitions & Consumers',
        tag: 'Messaging',
        sceneType: 'loom',
        summary: 'How Kafka scales horizontal throughput via consumer group rebalancing.'
      }
    ]
  },
  {
    id: 'ai-foundations',
    name: 'AI Math for Java Devs',
    icon: '🌌',
    badge: 'COMING UP',
    summary: 'High-dimensional vector spaces, cosine similarity, tokenization, and transformer attention matrices.',
    subtopics: [
      {
        id: 'vector-space-3d',
        title: '3D Semantic Vector Space & Cosine Similarity',
        simpleTitle: 'The Meaning Galaxy: How Sentences Become 3D Coordinates',
        tag: 'AI Fundamentals',
        sceneType: 'loom',
        summary: 'Demystifying vector embeddings and nearest-neighbor search for Java developers.'
      }
    ]
  },
  {
    id: 'spring-ai',
    name: 'Enterprise Spring AI',
    icon: '🤖',
    badge: 'COMING UP',
    summary: 'Production AI in Java: ChatClient, PgVector RAG pipelines, and autonomous @Tool function calling.',
    subtopics: [
      {
        id: 'spring-ai-rag',
        title: 'Spring AI RAG & PgVector Ingestion',
        simpleTitle: 'The RAG Fusion Reactor: Documents to Vectors to Answers',
        tag: 'Spring AI',
        sceneType: 'loom',
        summary: 'Retrieval-Augmented Generation using Spring AI and PostgreSQL pgvector.'
      }
    ]
  },
  {
    id: 'agents-mcp',
    name: 'Autonomous Agents & MCP',
    icon: '⚔️',
    badge: 'COMING UP',
    summary: 'LangChain4j ReAct agent loops and Model Context Protocol (MCP) in Java.',
    subtopics: [
      {
        id: 'agentic-loop',
        title: 'LangChain4j ReAct Agent Loop in 3D',
        simpleTitle: 'The Agent Brain: Thought -> Action -> Observation Loop',
        tag: 'Agentic Workflows',
        sceneType: 'loom',
        summary: 'Building autonomous AI agents that invoke Java enterprise tools.'
      }
    ]
  },
  {
    id: 'dsa-arena',
    name: '3D DSA & 100+ Challenges',
    icon: '🏆',
    badge: 'COMING UP',
    summary: 'Interactive 3D self-balancing trees, graphs, and 100+ Senior visual interview problems.',
    subtopics: [
      {
        id: 'tree-balancing',
        title: 'Self-Balancing Red-Black Trees in 3D',
        simpleTitle: 'The Tree Acrobat: Visualizing Rotations & Color Flips',
        tag: 'Data Structures',
        sceneType: 'loom',
        summary: 'Step through left and right tree rotations in real 3D space.'
      }
    ]
  }
];
