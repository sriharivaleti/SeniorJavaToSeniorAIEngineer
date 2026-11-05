/**
 * The Java AI Workshop - 20-Day Curriculum & Knowledge Taxonomy
 * Designed for Senior Java Developers transitioning to Senior Java AI Engineers.
 */

export const CURRICULUM_PILLARS = [
  {
    id: 'modern-java',
    title: 'Modern Java & Loom',
    subtitle: 'Java 8 to 25 + Project Loom',
    icon: '⚡',
    color: '#00f3ff', // Cyan
    summary: 'Master Virtual Threads, Structured Concurrency, Scoped Values, Pattern Matching, and Java 21-25 cutting edge features.',
    days: [1, 2, 4, 5],
    subtopics: [
      'Project Loom: Virtual Threads vs OS Carrier Threads',
      'Structured Concurrency & Scoped Values',
      'Modern Pattern Matching, Records & Sealed Classes',
      'Vector API (SIMD) & Project Panama (Foreign Function & Memory)',
      'CompletableFuture DAGs & Reactive Streams Internals'
    ]
  },
  {
    id: 'jvm-internals',
    title: 'Deep JVM & Memory',
    subtitle: 'Runtime Areas & GC Physics',
    icon: '🧠',
    color: '#ffaa00', // Amber
    summary: 'Transparent 3D exploration of Heap, Stack, Metaspace, JIT Tiered Compilation, and modern GC algorithms (ZGC, G1, Shenandoah).',
    days: [3],
    subtopics: [
      'JVM Runtime Data Areas: Eden, S0/S1, Tenured, Metaspace',
      'Stack Frames, Operand Stacks & Local Variable Arrays',
      'ZGC Colored Pointers & Load Barriers',
      'JIT C1/C2 Compilation, Inlining & Escape Analysis',
      'Off-Heap Direct Memory & Zero-Copy Allocations'
    ]
  },
  {
    id: 'enterprise-data',
    title: 'Jakarta EE & Persistence',
    subtitle: 'HikariCP & PostgreSQL MVCC',
    icon: '🏛️',
    color: '#ff3366', // Crimson Neon
    summary: 'Liquid pipe dynamics of JDBC connection pools, Servlet request chains, and database transaction isolation levels under the hood.',
    days: [6],
    subtopics: [
      'HikariCP Connection Pool Mechanics & Leak Detection',
      'Servlet Filter Chains & Non-blocking I/O Packets',
      'PostgreSQL MVCC (Multi-Version Concurrency Control) 3D Layers',
      'WAL (Write-Ahead Logging) & Checkpointing Dynamics',
      'ACID Guarantees: Dirty Reads, Non-Repeatable Reads, Phantoms'
    ]
  },
  {
    id: 'spring-cloud',
    title: 'Spring Boot 3 & Systems',
    subtitle: 'IoC Laser Grid & WebFlux',
    icon: '🌱',
    color: '#00ff88', // Emerald
    summary: 'Holographic Spring IoC bean wiring, Spring WebFlux event loops, and cloud-native microservice architecture.',
    days: [7, 8],
    subtopics: [
      'Spring 3 IoC Container & Bean Dependency Graph',
      'AOP Bytecode Proxies (JDK Dynamic vs CGLIB)',
      'Spring WebFlux: Project Reactor EventLoop & Backpressure',
      'GraalVM Native Images & Ahead-of-Time (AOT) Processing',
      'Distributed Tracing with Micrometer & OpenTelemetry'
    ]
  },
  {
    id: 'distributed-systems',
    title: 'Distributed Infrastructure',
    subtitle: 'Kafka, Redis & Consensus',
    icon: '🌐',
    color: '#9933ff', // Purple Neon
    summary: '3D Kafka partition rings, Redis distributed cache mechanics, and Raft consensus leader election clusters.',
    days: [9, 10, 11],
    subtopics: [
      'Kafka 3D Partition Ring & Consumer Rebalancing',
      'Redis Cache Patterns: LRU/LFU 3D Conveyor & Cache-Aside',
      'Consistent Hashing Rings & Virtual Nodes',
      'Raft Distributed Consensus: Leader Elections & Heartbeats',
      'Resilience4j: Circuit Breakers, Bulkheads & Rate Limiters'
    ]
  },
  {
    id: 'ai-foundations',
    title: 'AI Math & Transformers',
    subtitle: 'Vector Space & Attention',
    icon: '🌌',
    color: '#00d2ff', // Electric Blue
    summary: 'Demystifying AI mathematics for Java developers: high-dimensional vector spaces, cosine similarity, and multi-head attention.',
    days: [12, 13],
    subtopics: [
      'Vector Embeddings: High-dimensional space projected to 3D',
      'Cosine Similarity & Dot Product Distance Radar',
      'Tokenization: BPE, WordPiece & Token Window Geometry',
      'Transformer Architecture: Self-Attention Matrix Heatmap',
      'Temperature, Top-P, and Probabilistic Token Sampling'
    ]
  },
  {
    id: 'spring-ai',
    title: 'Enterprise Spring AI',
    subtitle: 'RAG, Vector DBs & Tools',
    icon: '🤖',
    color: '#ff00aa', // Magenta Neon
    summary: 'Production AI in Java with Spring AI: ChatClient, PgVector integration, hybrid search, and autonomous @Tool execution.',
    days: [14, 15, 16],
    subtopics: [
      'Spring AI ChatClient & Prompt Engineering Pipelines',
      'Document Chunking, Embedding & PgVector HNSW Indexing',
      'Hybrid Retrieval: Dense Vector + Sparse BM25 Fusion',
      'Autonomous Function Calling with Java @Tool Annotations',
      'Structured Outputs mapped to Java 21 Records'
    ]
  },
  {
    id: 'agentic-ai-dsa',
    title: 'Agents, MCP & 3D DSA',
    subtitle: 'LangChain4j & 100+ Challenges',
    icon: '⚔️',
    color: '#ffcc00', // Gold Neon
    summary: 'ReAct autonomous agent loops, Model Context Protocol (MCP) in Java, and 100+ visual data structure challenges.',
    days: [17, 18, 19, 20],
    subtopics: [
      'LangChain4j ReAct Agent Loop & ChatMemory Graph',
      'Model Context Protocol (MCP) in Java: Client/Server Mesh',
      '3D Self-Balancing Trees (AVL, Red-Black) & Graph A* Traversal',
      'Concurrency Locks: ReentrantLock vs Synchronized in 3D',
      '100+ Senior Visual Interview Challenge Matrix'
    ]
  }
];

export const DAILY_ROADMAP = [
  {
    day: 1,
    title: 'Platform Threads vs Virtual Threads (Project Loom)',
    category: 'Modern Java',
    pillarId: 'modern-java',
    status: 'ACTIVE',
    badge: 'DAY 1 - LAUNCH',
    summary: 'Interactive 3D visual comparison of heavy 1:1 OS Platform Threads vs ultra-lightweight M:N Virtual Threads scheduled on Carrier Threads.',
    challenge: 'Benchmark 100,000 concurrent threads without OutOfMemoryError and visualize carrier thread handoffs.',
    javaSnippet: `// Java 21+ Project Loom: High-Throughput Concurrency
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 100_000).forEach(i -> {
        executor.submit(() -> {
            // Virtual thread parks on I/O without blocking OS carrier thread!
            Thread.sleep(Duration.ofMillis(100));
            return "Task " + i + " completed on " + Thread.currentThread();
        });
    });
} // Automatic structured join at close of scope!`
  },
  {
    day: 2,
    title: 'Structured Concurrency & Scoped Values',
    category: 'Modern Java',
    pillarId: 'modern-java',
    status: 'UPCOMING',
    badge: 'DAY 2',
    summary: 'Coordinate multi-threaded tasks as a single atomic unit of work with StructuredTaskScope, eliminating thread leaks.',
    challenge: 'Build a multi-source aggregator with fail-fast cancellation and scoped security context.',
    javaSnippet: `// Structured Task Scope (Java 21+ Preview)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Supplier<User> user = scope.fork(() -> fetchUser(id));
    Supplier<Order> order = scope.fork(() -> fetchRecentOrder(id));

    scope.join().throwIfFailed(); // Joins both, cancels others if one fails!
    return new Dashboard(user.get(), order.get());
}`
  },
  {
    day: 3,
    title: 'The 3D Transparent JVM Engine & GC Mechanics',
    category: 'JVM Internals',
    pillarId: 'jvm-internals',
    status: 'UPCOMING',
    badge: 'DAY 3',
    summary: 'Real-time 3D simulation of Heap spaces (Eden, Survivor, Tenured), Metaspace, and generational G1/ZGC pointer marking.',
    challenge: 'Simulate memory leak diagnostics and observe generational promotion in 3D.',
    javaSnippet: `// Low-latency ZGC colored pointers in action
// VM Options: -XX:+UseZGC -XX:+ZGenerational
// ZGC eliminates stop-the-world pauses under 1ms even with terabytes of heap!`
  },
  {
    day: 4,
    title: 'Pattern Matching, Records & Sealed Hierarchies',
    category: 'Modern Java',
    pillarId: 'modern-java',
    status: 'UPCOMING',
    badge: 'DAY 4',
    summary: 'Exhaustive pattern matching for switch, record deconstruction, and compile-time sealed domain hierarchies visualized as a 3D tree.',
    challenge: 'Implement an AST evaluator using sealed interface algebra with zero boilerplate.',
    javaSnippet: `public sealed interface AiEvent permits PromptSent, TokenStreamed, ModelFailed {}
public record TokenStreamed(String token, int index) implements AiEvent {}

String handle(AiEvent event) => switch(event) {
    case PromptSent(var p) -> "Dispatched: " + p;
    case TokenStreamed(var tok, var idx) -> "Token #" + idx + ": " + tok;
    case ModelFailed(var err) -> "Recovery activated: " + err;
};`
  },
  {
    day: 5,
    title: 'Hardware Acceleration: SIMD Vector API & Panama',
    category: 'Modern Java',
    pillarId: 'modern-java',
    status: 'UPCOMING',
    badge: 'DAY 5',
    summary: 'Harness 512-bit AVX CPU registers for ultra-fast dot products and vector similarity directly in pure Java.',
    challenge: 'Compute 1536-dimensional cosine similarity across 10,000 vectors in under 2ms using Vector API.',
    javaSnippet: `// SIMD Vector API for Cosine Similarity Calculation
static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;
for (int i = 0; i < species.loopBound(a.length); i += SPECIES.length()) {
    var va = FloatVector.fromArray(SPECIES, a, i);
    var vb = FloatVector.fromArray(SPECIES, b, i);
    va.mul(vb).intoArray(res, i);
}`
  },
  {
    day: 6,
    title: 'HikariCP Pool & PostgreSQL MVCC Time Travel',
    category: 'Persistence',
    pillarId: 'enterprise-data',
    status: 'UPCOMING',
    badge: 'DAY 6',
    summary: 'Liquid dynamics of high-performance connection pooling and 3D visualization of PostgreSQL row versions (xmin/xmax).',
    challenge: 'Demonstrate deadlocks, connection leaks, and repeatable read isolation anomalies.',
    javaSnippet: `HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/aistore");
config.setMaximumPoolSize(20);
config.setLeakDetectionThreshold(2000); // 2 sec leak alerts`
  },
  {
    day: 7,
    title: 'Spring Boot 3 IoC Container & Bean Graph',
    category: 'Spring Boot',
    pillarId: 'spring-cloud',
    status: 'UPCOMING',
    badge: 'DAY 7',
    summary: 'Holographic dependency injection graph, bean lifecycle hooks, and circular dependency resolution in 3D.',
    challenge: 'Inspect bean creation order, proxy wrappers, and conditional configurations.',
    javaSnippet: `@Configuration(proxyBeanMethods = false)
public class AiConfig {
    @Bean
    @ConditionalOnMissingBean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.defaultSystem("You are a Senior Java AI Architect.").build();
    }
}`
  },
  {
    day: 8,
    title: 'Spring WebFlux & Reactive Backpressure',
    category: 'Spring Boot',
    pillarId: 'spring-cloud',
    status: 'UPCOMING',
    badge: 'DAY 8',
    summary: 'EventLoop threads, Project Reactor Flux/Mono streams, and dynamic backpressure valve visualizer in 3D.',
    challenge: 'Stream 1,000,000 AI tokens to clients with bounded buffer backpressure.',
    javaSnippet: `Flux<ServerSentEvent<String>> streamTokens(Prompt prompt) {
    return chatClient.prompt(prompt)
        .stream()
        .content()
        .map(token -> ServerSentEvent.builder(token).build())
        .onBackpressureBuffer(100);
}`
  },
  {
    day: 9,
    title: 'Kafka 3D Partition Ring & Consumer Rebalance',
    category: 'Distributed Systems',
    pillarId: 'distributed-systems',
    status: 'UPCOMING',
    badge: 'DAY 9',
    summary: '3D circular Kafka cluster showing partition leaders, replicas, consumer offsets, and cooperative sticky rebalancing.',
    challenge: 'Simulate broker node crash and rebalance without consumer downtime.',
    javaSnippet: `ConcurrentKafkaListenerContainerFactory<String, AiTask> factory = ...;
factory.setConcurrency(6); // 6 consumer threads mapped to 6 partitions
factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);`
  },
  {
    day: 10,
    title: 'Redis Distributed Caching & LRU Conveyor',
    category: 'Distributed Systems',
    pillarId: 'distributed-systems',
    status: 'UPCOMING',
    badge: 'DAY 10',
    summary: 'Physical 3D conveyor belt demonstrating LRU/LFU cache evictions, cache stampede prevention, and Redis clustering.',
    challenge: 'Implement probabilistic cache renewal (XFetch) to eliminate cache stampedes.',
    javaSnippet: `// Distributed Semantic Cache for AI Prompts in Redis
String cacheKey = "prompt:hash:" + hash(promptEmbedding);
String cachedResponse = redisTemplate.opsForValue().get(cacheKey);`
  },
  {
    day: 11,
    title: 'Raft Consensus & Resilient Circuit Breakers',
    category: 'Distributed Systems',
    pillarId: 'distributed-systems',
    status: 'UPCOMING',
    badge: 'DAY 11',
    summary: '3D node cluster conducting Raft leader elections with visual heartbeats, paired with Resilience4j circuit breakers.',
    challenge: 'Trigger partition split-brain and observe quorum healing.',
    javaSnippet: `CircuitBreakerConfig config = CircuitBreakerConfig.custom()
    .failureRateThreshold(50)
    .waitDurationInOpenState(Duration.ofSeconds(10))
    .slidingWindowSize(20)
    .build();`
  },
  {
    day: 12,
    title: 'AI Math: 3D Vector Space & Cosine Similarity',
    category: 'AI Foundations',
    pillarId: 'ai-foundations',
    status: 'UPCOMING',
    badge: 'DAY 12',
    summary: 'Step inside high-dimensional embedding space projected to 3D. Compare semantic distances between sentences.',
    challenge: 'Calculate dot product, Euclidean distance, and cosine similarity with interactive spatial vectors.',
    javaSnippet: `public static double cosineSimilarity(float[] v1, float[] v2) {
    double dot = 0.0, normA = 0.0, normB = 0.0;
    for (int i = 0; i < v1.length; i++) {
        dot += v1[i] * v2[i];
        normA += v1[i] * v1[i];
        normB += v2[i] * v2[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}`
  },
  {
    day: 13,
    title: 'Transformers, Attention Matrix & Token Geometry',
    category: 'AI Foundations',
    pillarId: 'ai-foundations',
    status: 'UPCOMING',
    badge: 'DAY 13',
    summary: 'Visualize self-attention query-key-value (Q, K, V) multiplications as glowing 3D heatmaps across token sequences.',
    challenge: 'Inspect attention weights of pronouns connecting to nouns across long context windows.',
    javaSnippet: `// Self-Attention: Softmax((Q * K^T) / sqrt(d_k)) * V
// Each token builds a dynamic contextual representation!`
  },
  {
    day: 14,
    title: 'Spring AI ChatClient & Structured Output Records',
    category: 'Spring AI',
    pillarId: 'spring-ai',
    status: 'UPCOMING',
    badge: 'DAY 14',
    summary: 'Master the fluent Spring AI ChatClient API, prompt templates, and strongly-typed JSON mapping to Java Records.',
    challenge: 'Build a code analysis agent that generates validated Java Records from unstructured requirements.',
    javaSnippet: `public record CodeReview(int score, List<String> issues, String refactoredCode) {}

CodeReview review = chatClient.prompt()
    .user("Review this Virtual Thread code: ...")
    .call()
    .entity(CodeReview.class); // Type-safe structured output!`
  },
  {
    day: 15,
    title: 'Spring AI RAG Pipeline & PgVector HNSW Indexing',
    category: 'Spring AI',
    pillarId: 'spring-ai',
    status: 'UPCOMING',
    badge: 'DAY 15',
    summary: 'Full 3D RAG flow: Ingest PDF/Java docs $\rightarrow$ Token Chunking $\rightarrow$ Embedding Generation $\rightarrow$ PgVector HNSW Graph Search.',
    challenge: 'Tune chunk sizes and top-k retrieval to maximize semantic precision and prevent hallucinations.',
    javaSnippet: `VectorStore vectorStore = new PgVectorStore(jdbcTemplate, embeddingModel);
List<Document> docs = tokenTextSplitter.apply(pdfReader.get());
vectorStore.add(docs);

// Hybrid Query
SearchRequest request = SearchRequest.query("Virtual Thread leak").withTopK(4);
List<Document> results = vectorStore.similaritySearch(request);`
  },
  {
    day: 16,
    title: 'Spring AI Function Calling & @Tool Orchestration',
    category: 'Spring AI',
    pillarId: 'spring-ai',
    status: 'UPCOMING',
    badge: 'DAY 16',
    summary: 'Watch an LLM autonomously invoke Java Spring `@Tool` beans in 3D, parse parameters, and synthesize business decisions.',
    challenge: 'Connect an LLM to a live SQL query tool and currency converter with zero hallucinated tool calls.',
    javaSnippet: `public record StockQuery(String symbol) {}

@Bean
@Description("Retrieve real-time stock price and P/E ratio")
public Function<StockQuery, StockPrice> stockLookupTool(MarketService service) {
    return query -> service.getLatest(query.symbol());
}`
  },
  {
    day: 17,
    title: 'LangChain4j ReAct Agent Loop & ChatMemory Graph',
    category: 'Autonomous Agents',
    pillarId: 'agentic-ai-dsa',
    status: 'UPCOMING',
    badge: 'DAY 17',
    summary: 'Interactive 3D state machine visualizer for the Thought $\rightarrow$ Action $\rightarrow$ Observation $\rightarrow$ Reflection cycle.',
    challenge: 'Build an autonomous multi-step software debugger agent that executes tests and patches bugs.',
    javaSnippet: `AiServices.builder(BugHunterAgent.class)
    .chatLanguageModel(model)
    .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
    .tools(new GitTool(), new MavenTestTool())
    .build();`
  },
  {
    day: 18,
    title: 'Model Context Protocol (MCP) in Java',
    category: 'Autonomous Agents',
    pillarId: 'agentic-ai-dsa',
    status: 'UPCOMING',
    badge: 'DAY 18',
    summary: 'The universal open standard connecting AI models to external tools and data sources, modeled as a 3D holographic network.',
    challenge: 'Implement an MCP Server in Java delivering live database telemetry directly to AI agents.',
    javaSnippet: `// MCP JSON-RPC Server in Java
McpServer server = McpServer.builder()
    .addResource("jvm://metrics", "Real-time JVM Heap telemetry", (req) -> getJvmMetrics())
    .addTool("gc://trigger", "Run System GC", (req) -> triggerGc())
    .build();`
  },
  {
    day: 19,
    title: '3D DSA Visualizer: Self-Balancing Trees & A* Search',
    category: 'DSA & Algorithms',
    pillarId: 'agentic-ai-dsa',
    status: 'UPCOMING',
    badge: 'DAY 19',
    summary: 'Interactive spatial Red-Black Tree rotation dynamics and 3D terrain A* pathfinding arena with glowing frontiers.',
    challenge: 'Step-through rebalancing rotations after node insertions in full 3D.',
    javaSnippet: `// Red-Black Tree Left-Rotate in 3D
private Node rotateLeft(Node h) {
    Node x = h.right;
    h.right = x.left;
    x.left = h;
    x.color = h.color;
    h.color = RED;
    return x;
}`
  },
  {
    day: 20,
    title: '100+ Visual Interview Challenges & Grand Graduation',
    category: 'DSA & Interviews',
    pillarId: 'agentic-ai-dsa',
    status: 'UPCOMING',
    badge: 'DAY 20',
    summary: 'Complete 3D Interview Challenge Console spanning concurrency, distributed locks, vector search, and JVM performance tuning.',
    challenge: 'Solve live visual coding questions and earn the Senior Java AI Engineer certification seal!',
    javaSnippet: `// CONGRATULATIONS! You have transitioned from Senior Java Engineer 
// to Senior Java AI Architect capable of building enterprise-grade 
// GenAI systems, high-throughput Loom services, and autonomous agent meshes!`
  }
];

