import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const subjects = ['programming', 'mathematics', 'science', 'languages', 'history', 'business']
const types = ['book', 'article', 'video']
const difficulties = ['beginner', 'intermediate', 'advanced', 'expert']

const resources = [
  // Programming - Books
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must-read for any developer who wants to write better code.",
    author: "Robert C. Martin",
    type: "book",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["software-engineering", "best-practices", "clean-code"],
    url: "https://www.oreilly.com/library/view/clean-code-a/9780136083238/",
  },
  {
    title: "The Pragmatic Programmer: Your Journey to Mastery",
    description: "Written as a collection of tips, this book covers topics ranging from personal responsibility and career development to architectural techniques for keeping your code flexible and easy to adapt.",
    author: "David Thomas, Andrew Hunt",
    type: "book",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["software-engineering", "career", "best-practices"],
    url: "https://pragprog.com/titles/tpp20/",
  },
  {
    title: "Structure and Interpretation of Computer Programs",
    description: "This classic text teaches fundamental principles of computer programming, including recursion, abstraction, modularity, and programming language design and implementation.",
    author: "Harold Abelson, Gerald Jay Sussman",
    type: "book",
    subject: "programming",
    difficulty: "advanced",
    tags: ["computer-science", "fundamentals", "lisp"],
    url: "https://mitpress.mit.edu/books/structure-and-interpretation-computer-programs-1",
  },
  {
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    description: "Capturing a wealth of experience about the design of object-oriented software, this book describes 23 patterns for designing object-oriented software.",
    author: "Gang of Four",
    type: "book",
    subject: "programming",
    difficulty: "advanced",
    tags: ["design-patterns", "object-oriented", "architecture"],
    url: "https://www.oreilly.com/library/view/design-patterns-elements/0201633612/",
  },
  {
    title: "Eloquent JavaScript: A Modern Introduction to Programming",
    description: "This is a book about JavaScript, programming, and the wonders of the digital. Perfect for beginners who want to learn programming through JavaScript.",
    author: "Marijn Haverbeke",
    type: "book",
    subject: "programming",
    difficulty: "beginner",
    tags: ["javascript", "web-development", "programming-fundamentals"],
    url: "https://eloquentjavascript.net/",
  },

  // Programming - Articles
  {
    title: "Understanding the Event Loop in JavaScript",
    description: "A deep dive into how JavaScript's event loop works, including the call stack, task queue, and microtask queue. Essential for understanding async programming.",
    author: "MDN Web Docs",
    type: "article",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["javascript", "async", "event-loop"],
    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop",
  },
  {
    title: "The Complete Guide to React Hooks",
    description: "Learn how to use React Hooks to manage state and side effects in functional components. Covers useState, useEffect, useContext, and custom hooks.",
    author: "React Documentation",
    type: "article",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["react", "hooks", "frontend"],
    url: "https://react.dev/reference/react",
  },
  {
    title: "Introduction to Git Flow",
    description: "Git Flow is a branching model for Git that provides a robust framework for managing larger projects. Learn how to implement it in your workflow.",
    author: "Atlassian",
    type: "article",
    subject: "programming",
    difficulty: "beginner",
    tags: ["git", "version-control", "workflow"],
    url: "https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow",
  },
  {
    title: "Microservices vs Monolithic Architecture",
    description: "Explore the trade-offs between microservices and monolithic architecture. When to use each approach and how to transition between them.",
    author: "Martin Fowler",
    type: "article",
    subject: "programming",
    difficulty: "advanced",
    tags: ["architecture", "microservices", "scalability"],
    url: "https://martinfowler.com/articles/microservices.html",
  },
  {
    title: "Understanding SOLID Principles",
    description: "SOLID is a set of five design principles that help developers create more maintainable, flexible, and scalable software. Learn each principle with examples.",
    author: "DigitalOcean",
    type: "article",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["solid", "design-principles", "oop"],
    url: "https://www.digitalocean.com/community/conceptual_articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design",
  },

  // Programming - Videos
  {
    title: "JavaScript Tutorial for Beginners",
    description: "A comprehensive video tutorial covering JavaScript fundamentals including variables, functions, objects, and DOM manipulation.",
    author: "Programming with Mosh",
    type: "video",
    subject: "programming",
    difficulty: "beginner",
    tags: ["javascript", "tutorial", "beginner"],
    url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
  },
  {
    title: "Building a Full-Stack App with Next.js",
    description: "Learn to build a complete full-stack application using Next.js, including server-side rendering, API routes, and database integration.",
    author: "Fireship",
    type: "video",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["nextjs", "fullstack", "react"],
    url: "https://www.youtube.com/watch?v=Sklc_fQBmYs",
  },
  {
    title: "System Design for Interviews",
    description: "Comprehensive guide to system design interviews. Learn how to design scalable systems and ace your technical interviews.",
    author: "ByteByteGo",
    type: "video",
    subject: "programming",
    difficulty: "advanced",
    tags: ["system-design", "interviews", "scalability"],
    url: "https://www.youtube.com/watch?v=i9g820UlGXA",
  },

  // Mathematics - Books
  {
    title: "Introduction to Linear Algebra",
    description: "A comprehensive introduction to linear algebra, covering vectors, matrices, determinants, eigenvalues, and applications in science and engineering.",
    author: "Gilbert Strang",
    type: "book",
    subject: "mathematics",
    difficulty: "intermediate",
    tags: ["linear-algebra", "matrices", "vectors"],
    url: "https://math.mit.edu/~gs/linearalgebra/",
  },
  {
    title: "Calculus: Early Transcendentals",
    description: "The classic calculus textbook that has helped millions of students learn calculus. Covers limits, derivatives, integrals, and infinite series.",
    author: "James Stewart",
    type: "book",
    subject: "mathematics",
    difficulty: "beginner",
    tags: ["calculus", "derivatives", "integrals"],
    url: "https://www.stewartcalculus.com/",
  },
  {
    title: "Discrete Mathematics and Its Applications",
    description: "Comprehensive coverage of discrete mathematics including logic, sets, relations, graphs, and combinatorics. Essential for computer science students.",
    author: "Kenneth Rosen",
    type: "book",
    subject: "mathematics",
    difficulty: "intermediate",
    tags: ["discrete-math", "logic", "combinatorics"],
    url: "https://www.mheducation.com/highered/product/discrete-mathematics-applications-rosen/M9780073383095.html",
  },
  {
    title: "The Art of Problem Solving",
    description: "Develop your problem-solving skills with this classic text. Covers strategies and techniques for solving mathematical problems.",
    author: "George Pólya",
    type: "book",
    subject: "mathematics",
    difficulty: "intermediate",
    tags: ["problem-solving", "strategies", "mathematical-thinking"],
    url: "https://www.amazon.com/How-Solve-Mathematical-Princeton-Science/dp/069116407X",
  },

  // Mathematics - Articles
  {
    title: "Understanding the Fourier Transform",
    description: "A visual and intuitive guide to understanding the Fourier Transform. Learn how it breaks down signals into their component frequencies.",
    author: "Better Explained",
    type: "article",
    subject: "mathematics",
    difficulty: "intermediate",
    tags: ["fourier-transform", "signal-processing", "visualization"],
    url: "https://betterexplained.com/articles/an-interactive-guide-to-the-fourier-transform/",
  },
  {
    title: "Probability Distributions Explained",
    description: "Learn about common probability distributions including normal, binomial, Poisson, and exponential distributions with examples.",
    author: "Towards Data Science",
    type: "article",
    subject: "mathematics",
    difficulty: "beginner",
    tags: ["probability", "statistics", "distributions"],
    url: "https://towardsdatascience.com/probability-distributions-explained-7c0b5b8b7c6a",
  },
  {
    title: "The Beauty of Prime Numbers",
    description: "Explore the fascinating world of prime numbers. Learn about their properties, distribution, and importance in cryptography.",
    author: "Numberphile",
    type: "article",
    subject: "mathematics",
    difficulty: "beginner",
    tags: ["prime-numbers", "number-theory", "cryptography"],
    url: "https://www.quantamagazine.org/",
  },

  // Mathematics - Videos
  {
    title: "Linear Algebra - Full Course",
    description: "Complete linear algebra course covering all fundamental concepts with visual explanations and practical examples.",
    author: "3Blue1Brown",
    type: "video",
    subject: "mathematics",
    difficulty: "intermediate",
    tags: ["linear-algebra", "visualization", "matrices"],
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
  },
  {
    title: "Statistics and Probability - Khan Academy",
    description: "Comprehensive introduction to statistics and probability, perfect for beginners. Covers descriptive statistics, probability distributions, and hypothesis testing.",
    author: "Khan Academy",
    type: "video",
    subject: "mathematics",
    difficulty: "beginner",
    tags: ["statistics", "probability", "beginner"],
    url: "https://www.khanacademy.org/math/statistics-probability",
  },

  // Science - Books
  {
    title: "The Feynman Lectures on Physics",
    description: "Richard Feynman's legendary lectures on physics, covering mechanics, electromagnetism, and quantum mechanics with his unique teaching style.",
    author: "Richard Feynman",
    type: "book",
    subject: "science",
    difficulty: "advanced",
    tags: ["physics", "mechanics", "quantum"],
    url: "https://www.feynmanlectures.caltech.edu/",
  },
  {
    title: "Chemistry: The Central Science",
    description: "A comprehensive general chemistry textbook covering atomic structure, chemical bonding, reactions, and organic chemistry fundamentals.",
    author: "Theodore L. Brown",
    type: "book",
    subject: "science",
    difficulty: "beginner",
    tags: ["chemistry", "general-science", "organic-chemistry"],
    url: "https://www.pearson.com/us/higher-education/program/Brown-Chemistry-The-Central-Science-14th-Edition/PGM1702086.html",
  },
  {
    title: "Molecular Biology of the Cell",
    description: "The definitive reference for cell and molecular biology. Covers cell structure, genetics, and cellular processes in detail.",
    author: "Bruce Alberts",
    type: "book",
    subject: "science",
    difficulty: "advanced",
    tags: ["biology", "cell-biology", "genetics"],
    url: "https://www.ncbi.nlm.nih.gov/books/NBK21054/",
  },
  {
    title: "Cosmos",
    description: "Carl Sagan's masterpiece exploring the universe, from the origins of life to the vastness of space. A beautiful blend of science and philosophy.",
    author: "Carl Sagan",
    type: "book",
    subject: "science",
    difficulty: "beginner",
    tags: ["astronomy", "cosmology", "popular-science"],
    url: "https://www.penguinrandomhouse.com/books/55321/cosmos-by-carl-sagan/",
  },

  // Science - Articles
  {
    title: "CRISPR Gene Editing: A Complete Guide",
    description: "Learn about CRISPR-Cas9 technology, how it works, its applications in medicine and agriculture, and ethical considerations.",
    author: "Nature",
    type: "article",
    subject: "science",
    difficulty: "intermediate",
    tags: ["genetics", "biotechnology", "crispr"],
    url: "https://www.nature.com/documents/crispr-guide",
  },
  {
    title: "Climate Change: The Science Explained",
    description: "A comprehensive overview of climate science, including evidence for global warming, impacts, and potential solutions.",
    author: "NASA",
    type: "article",
    subject: "science",
    difficulty: "beginner",
    tags: ["climate-change", "environment", "earth-science"],
    url: "https://climate.nasa.gov/",
  },
  {
    title: "The Human Microbiome",
    description: "Explore the trillions of microorganisms living in and on our bodies. Learn about their role in health and disease.",
    author: "Scientific American",
    type: "article",
    subject: "science",
    difficulty: "intermediate",
    tags: ["microbiology", "health", "microbiome"],
    url: "https://www.scientificamerican.com/",
  },

  // Science - Videos
  {
    title: "MIT 8.01 Classical Mechanics",
    description: "MIT's introductory physics course covering Newtonian mechanics, work and energy, momentum, and rotational motion.",
    author: "MIT OpenCourseWare",
    type: "video",
    subject: "science",
    difficulty: "intermediate",
    tags: ["physics", "mechanics", "mit"],
    url: "https://ocw.mit.edu/courses/8-01sc-classical-mechanics-fall-2016/",
  },
  {
    title: "Organic Chemistry - Crash Course",
    description: "Fun and engaging introduction to organic chemistry covering nomenclature, reactions, and functional groups.",
    author: "Crash Course",
    type: "video",
    subject: "science",
    difficulty: "beginner",
    tags: ["chemistry", "organic-chemistry", "crash-course"],
    url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtONguuh2L7hHdnqOZ9hA2Fj",
  },

  // Languages - Books
  {
    title: "Fluent Forever: How to Learn Any Language",
    description: "A revolutionary method for language learning based on neuroscience. Learn to think in a new language and never forget vocabulary.",
    author: "Gabriel Wyner",
    type: "book",
    subject: "languages",
    difficulty: "beginner",
    tags: ["language-learning", "memory", "methodology"],
    url: "https://fluent-forever.com/",
  },
  {
    title: "The Art of Language Learning",
    description: "Explore the science and art behind learning new languages. Covers cognitive processes, learning strategies, and cultural immersion.",
    author: "Barry Farber",
    type: "book",
    subject: "languages",
    difficulty: "beginner",
    tags: ["language-learning", "strategies", "polyglot"],
    url: "https://www.amazon.com/How-Learn-Language-Barry-Farber/dp/1567315437",
  },
  {
    title: "English Grammar in Use",
    description: "The world's best-selling grammar book for intermediate learners. Clear explanations and practice exercises for English grammar.",
    author: "Raymond Murphy",
    type: "book",
    subject: "languages",
    difficulty: "intermediate",
    tags: ["english", "grammar", "reference"],
    url: "https://www.cambridge.org/core/books/english-grammar-in-use/",
  },

  // Languages - Articles
  {
    title: "The Best Methods for Language Immersion",
    description: "How to create an immersive language learning environment at home. Tips for media consumption, conversation practice, and cultural exposure.",
    author: "FluentU",
    type: "article",
    subject: "languages",
    difficulty: "beginner",
    tags: ["immersion", "language-learning", "tips"],
    url: "https://www.fluentu.com/",
  },
  {
    title: "Understanding Language Proficiency Levels (CEFR)",
    description: "Learn about the Common European Framework of Reference for Languages and how to assess your proficiency level accurately.",
    author: "Council of Europe",
    type: "article",
    subject: "languages",
    difficulty: "beginner",
    tags: ["cefr", "proficiency", "assessment"],
    url: "https://www.coe.int/lang-cefr",
  },

  // Languages - Videos
  {
    title: "Spanish for Beginners - Complete Course",
    description: "Full Spanish course covering pronunciation, grammar, vocabulary, and conversation for absolute beginners.",
    author: "Butterfly Spanish",
    type: "video",
    subject: "languages",
    difficulty: "beginner",
    tags: ["spanish", "beginner", "complete-course"],
    url: "https://www.youtube.com/watch?v=7D8eJQwX9HQ",
  },
  {
    title: "Japanese Writing System Explained",
    description: "Learn about Hiragana, Katakana, and Kanji. Understand how the Japanese writing system works and how to learn it effectively.",
    author: "Japanese Ammo",
    type: "video",
    subject: "languages",
    difficulty: "beginner",
    tags: ["japanese", "writing-system", "kanji"],
    url: "https://www.youtube.com/watch?v=PHedbs7dKrw",
  },

  // History - Books
  {
    title: "Sapiens: A Brief History of Humankind",
    description: "A groundbreaking narrative of humanity's history, from the Stone Age to the age of algorithms. Explores how Homo sapiens came to dominate the planet.",
    author: "Yuval Noah Harari",
    type: "book",
    subject: "history",
    difficulty: "beginner",
    tags: ["world-history", "anthropology", "civilization"],
    url: "https://www.ynharari.com/book/sapiens/",
  },
  {
    title: "Guns, Germs, and Steel",
    description: "Why did history unfold differently on different continents? Jared Diamond explores the environmental factors that shaped human societies.",
    author: "Jared Diamond",
    type: "book",
    subject: "history",
    difficulty: "intermediate",
    tags: ["world-history", "geography", "civilization"],
    url: "https://www.penguinrandomhouse.com/books/105825/guns-germs-and-steel-by-jared-diamond/",
  },
  {
    title: "The Silk Roads: A New History of the World",
    description: "A major reassessment of world history, The Silk Roads recounts how the East was the engine of global trade and cultural exchange.",
    author: "Peter Frankopan",
    type: "book",
    subject: "history",
    difficulty: "intermediate",
    tags: ["world-history", "trade", "cultural-exchange"],
    url: "https://www.bloomsbury.com/uk/silk-roads-9781408839973/",
  },

  // History - Articles
  {
    title: "The Fall of the Roman Empire: Causes and Effects",
    description: "Explore the complex factors that led to the decline of one of history's greatest empires, from economic troubles to barbarian invasions.",
    author: "History Today",
    type: "article",
    subject: "history",
    difficulty: "intermediate",
    tags: ["rome", "ancient-history", "empires"],
    url: "https://www.historytoday.com/",
  },
  {
    title: "The Industrial Revolution: A Turning Point in History",
    description: "How the Industrial Revolution transformed society, economy, and daily life. Explore its origins, key innovations, and lasting impacts.",
    author: "Britannica",
    type: "article",
    subject: "history",
    difficulty: "beginner",
    tags: ["industrial-revolution", "modern-history", "technology"],
    url: "https://www.britannica.com/event/Industrial-Revolution",
  },

  // History - Videos
  {
    title: "World History - Crash Course",
    description: "Engaging and comprehensive world history series covering from the Agricultural Revolution to modern times.",
    author: "Crash Course",
    type: "video",
    subject: "history",
    difficulty: "beginner",
    tags: ["world-history", "crash-course", "overview"],
    url: "https://www.youtube.com/playlist?list=PLBDA2E52FB1EF80C9",
  },
  {
    title: "The History of Ancient Egypt",
    description: "Explore 3,000 years of Egyptian history, from the first pharaohs to the conquest by Alexander the Great.",
    author: "The Great Courses",
    type: "video",
    subject: "history",
    difficulty: "intermediate",
    tags: ["egypt", "ancient-history", "pharaohs"],
    url: "https://www.thegreatcourses.com/courses/history-of-ancient-egypt.html",
  },

  // Business - Books
  {
    title: "Thinking, Fast and Slow",
    description: "Nobel laureate Daniel Kahneman explores the two systems that drive the way we think: the fast, intuitive system and the slow, deliberate system.",
    author: "Daniel Kahneman",
    type: "book",
    subject: "business",
    difficulty: "intermediate",
    tags: ["psychology", "decision-making", "behavioral-economics"],
    url: "https://www.penguinrandomhouse.com/books/89306/thinking-fast-and-slow-by-daniel-kahneman/",
  },
  {
    title: "The Lean Startup",
    description: "How today's entrepreneurs use continuous innovation to create radically successful businesses. Essential reading for startup founders.",
    author: "Eric Ries",
    type: "book",
    subject: "business",
    difficulty: "beginner",
    tags: ["startup", "entrepreneurship", "innovation"],
    url: "https://theleanstartup.com/",
  },
  {
    title: "Good to Great: Why Some Companies Make the Leap",
    description: "Based on a comprehensive study, this book reveals why some companies transition from good to great while others don't.",
    author: "Jim Collins",
    type: "book",
    subject: "business",
    difficulty: "intermediate",
    tags: ["management", "leadership", "business-strategy"],
    url: "https://www.jimcollins.com/books/good-to-great.html",
  },
  {
    title: "Zero to One: Notes on Startups",
    description: "Peter Thiel's contrarian wisdom on innovation and building the future. How to build startups that create new things rather than compete.",
    author: "Peter Thiel",
    type: "book",
    subject: "business",
    difficulty: "intermediate",
    tags: ["startup", "innovation", "entrepreneurship"],
    url: "https://www.penguinrandomhouse.com/books/316391/zero-to-one-by-peter-thiel-with-blake-masters/",
  },

  // Business - Articles
  {
    title: "Introduction to Financial Statements",
    description: "Learn to read and understand financial statements including balance sheets, income statements, and cash flow statements.",
    author: "Investopedia",
    type: "article",
    subject: "business",
    difficulty: "beginner",
    tags: ["finance", "accounting", "financial-statements"],
    url: "https://www.investopedia.com/articles/04/031004.asp",
  },
  {
    title: "The Basics of Marketing Strategy",
    description: "A comprehensive guide to developing effective marketing strategies, from market research to positioning and execution.",
    author: "Harvard Business Review",
    type: "article",
    subject: "business",
    difficulty: "intermediate",
    tags: ["marketing", "strategy", "business"],
    url: "https://hbr.org/topic/subject/marketing",
  },
  {
    title: "Understanding Agile Methodology",
    description: "How Agile methodology transformed software development and how its principles can be applied to project management.",
    author: "Atlassian",
    type: "article",
    subject: "business",
    difficulty: "beginner",
    tags: ["agile", "project-management", "methodology"],
    url: "https://www.atlassian.com/agile",
  },

  // Business - Videos
  {
    title: "Stanford Entrepreneurship Lectures",
    description: "Learn from successful entrepreneurs and investors in this lecture series from Stanford University's entrepreneurship program.",
    author: "Stanford eCorner",
    type: "video",
    subject: "business",
    difficulty: "intermediate",
    tags: ["entrepreneurship", "stanford", "lectures"],
    url: "https://ecorner.stanford.edu/",
  },
  {
    title: "Financial Markets - Yale Course",
    description: "Yale University's course on financial markets, covering stocks, bonds, derivatives, and the role of financial institutions.",
    author: "Robert Shiller",
    type: "video",
    subject: "business",
    difficulty: "intermediate",
    tags: ["finance", "markets", "yale"],
    url: "https://oyc.yale.edu/economics/econ-252",
  },

  // Additional Programming Resources
  {
    title: "Refactoring: Improving the Design of Existing Code",
    description: "Learn techniques for improving the design of existing code without changing its behavior. Essential for maintaining large codebases.",
    author: "Martin Fowler",
    type: "book",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["refactoring", "clean-code", "maintenance"],
    url: "https://martinfowler.com/books/refactoring.html",
  },
  {
    title: "Domain-Driven Design: Tackling Complexity",
    description: "How to tackle complexity in software development by focusing on the core domain and domain logic.",
    author: "Eric Evans",
    type: "book",
    subject: "programming",
    difficulty: "advanced",
    tags: ["ddd", "architecture", "enterprise"],
    url: "https://www.domainlanguage.com/ddd/",
  },
  {
    title: "Functional Programming in JavaScript",
    description: "An introduction to functional programming concepts and how to apply them in JavaScript applications.",
    author: "Frontend Masters",
    type: "article",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["functional-programming", "javascript", "paradigms"],
    url: "https://frontendmasters.com/courses/functional-javascript/",
  },
  {
    title: "API Design Best Practices",
    description: "How to design RESTful APIs that are intuitive, consistent, and easy to use. Covers naming, versioning, and error handling.",
    author: "Postman",
    type: "article",
    subject: "programming",
    difficulty: "intermediate",
    tags: ["api", "rest", "design"],
    url: "https://www.postman.com/api-platform/api-design/",
  },

  // Additional Mathematics Resources
  {
    title: "Concrete Mathematics: A Foundation for Computer Science",
    description: "A blend of continuous and discrete mathematics, specifically designed for computer science students and practitioners.",
    author: "Ronald Graham, Donald Knuth",
    type: "book",
    subject: "mathematics",
    difficulty: "advanced",
    tags: ["discrete-math", "computer-science", "algorithms"],
    url: "https://www.oreilly.com/library/view/concrete-mathematics-a/9780134388491/",
  },
  {
    title: "Introduction to Algorithms",
    description: "The comprehensive introduction to modern algorithms, covering design, analysis, and implementation.",
    author: "CLRS",
    type: "book",
    subject: "mathematics",
    difficulty: "advanced",
    tags: ["algorithms", "computer-science", "analysis"],
    url: "https://mitpress.mit.edu/books/introduction-algorithms-fourth-edition",
  },

  // Additional Science Resources
  {
    title: "A Brief History of Time",
    description: "Stephen Hawking's masterpiece exploring the origins and fate of the universe, black holes, and the nature of time.",
    author: "Stephen Hawking",
    type: "book",
    subject: "science",
    difficulty: "beginner",
    tags: ["physics", "cosmology", "popular-science"],
    url: "https://www.penguinrandomhouse.com/books/85674/a-brief-history-of-time-by-stephen-hawking/",
  },
  {
    title: "The Gene: An Intimate History",
    description: "A sweeping history of the gene and a brilliant exploration of the challenges and ethical dilemmas that genetic science poses.",
    author: "Siddhartha Mukherjee",
    type: "book",
    subject: "science",
    difficulty: "intermediate",
    tags: ["genetics", "biology", "history-of-science"],
    url: "https://www.siddharthamukherjee.com/the-gene",
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data
  await prisma.userInteraction.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.youTubeCache.deleteMany()

  console.log('✅ Cleaned existing data')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@studylens.com',
      name: 'Demo User',
      password: hashedPassword,
    }
  })
  console.log('✅ Created demo user:', demoUser.email)

  // Create demo user profile
  await prisma.userProfile.create({
    data: {
      userId: demoUser.id,
      subjects: JSON.stringify(['programming', 'mathematics']),
      formats: JSON.stringify(['books', 'videos']),
      experienceLevel: 'intermediate',
      timeCommitment: 'moderate',
      onboardingCompleted: true,
    }
  })
  console.log('✅ Created demo user profile')

  // Create resources
  let resourceCount = 0
  for (const resource of resources) {
    await prisma.resource.create({
      data: {
        ...resource,
        tags: JSON.stringify(resource.tags),
        likeCount: Math.floor(Math.random() * 100),
        viewCount: Math.floor(Math.random() * 500),
      }
    })
    resourceCount++
  }
  console.log(`✅ Created ${resourceCount} resources`)

  // Summary
  console.log('\n📊 Seed Summary:')
  console.log(`   Users: 1`)
  console.log(`   Resources: ${resourceCount}`)
  console.log(`   Subjects: ${subjects.join(', ')}`)
  console.log(`   Types: ${types.join(', ')}`)
  console.log('\n✨ Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
