# Research: Free Educational Resources for StudyLens Integration

## Overview
This document catalogs free APIs and data sources that can be integrated into StudyLens to expand our resource library beyond the current database of 62 items.

---

## 1. FREE BOOKS & EBOOKS

### Open Library API (Internet Archive)
- **URL**: https://openlibrary.org/developers/api
- **Type**: REST API
- **Cost**: FREE
- **Data Available**: 
  - Millions of books metadata
  - Book covers
  - Availability status
  - Borrow/read links
- **Rate Limit**: No strict limits (be respectful)
- **Coverage**: All subjects
- **Integration Complexity**: MEDIUM
- **Notes**: Has both free and borrow-able books. Can search by subject, author, title.

### Project Gutenberg
- **URL**: https://www.gutenberg.org/ebooks/
- **Type**: REST API / Direct Downloads
- **Cost**: FREE (public domain)
- **Data Available**:
  - 70,000+ free ebooks
  - Multiple formats (EPUB, Kindle, HTML, plain text)
  - Metadata (author, title, language, subject)
- **Rate Limit**: Be respectful
- **Coverage**: Classic literature, history, science
- **Integration Complexity**: LOW
- **Notes**: All books are completely free (public domain). Great for literature and history.

### OpenStax (Rice University)
- **URL**: https://openstax.org/
- **Type**: Website / Direct Access
- **Cost**: FREE (open-source textbooks)
- **Data Available**:
  - 50+ peer-reviewed textbooks
  - Subjects: Math, Science, Social Sciences, Humanities
  - Available in multiple formats
- **Coverage**: Academic subjects (math, physics, biology, economics, etc.)
- **Integration Complexity**: LOW
- **Notes**: High-quality, peer-reviewed academic textbooks. Perfect for students.

### Google Books API
- **URL**: https://developers.google.com/books
- **Type**: REST API
- **Cost**: FREE (with limits)
- **Data Available**:
  - Book metadata
  - Preview links
  - Thumbnails
  - 1,000 requests/day free tier
- **Rate Limit**: 1,000 requests/day (free)
- **Coverage**: All subjects
- **Integration Complexity**: MEDIUM
- **Notes**: Can filter by "free ebooks" to get public domain books.

---

## 2. FREE COURSES & TUTORIALS

### freeCodeCamp
- **URL**: https://www.freecodecamp.org/
- **Type**: Website / Curriculum
- **Cost**: FREE
- **Data Available**:
  - 9,000+ tutorials
  - Full curricula for web dev, data science, etc.
  - Video courses on YouTube
- **Coverage**: Programming, Web Development, Data Science, Machine Learning
- **Integration Complexity**: MEDIUM (scraping needed)
- **Notes**: Excellent for programming resources. Has API course data.

### Khan Academy
- **URL**: https://www.khanacademy.org/
- **Type**: Website / YouTube
- **Cost**: FREE
- **Data Available**:
  - 10,000+ videos
  - Interactive exercises
  - Covers K-12 and early college
- **Coverage**: Math, Science, Computing, Arts, Humanities
- **Integration Complexity**: MEDIUM
- **Notes**: YouTube videos can be embedded. Excellent for math and science.

### MIT OpenCourseWare
- **URL**: https://ocw.mit.edu/
- **Type**: Website / API (limited)
- **Cost**: FREE
- **Data Available**:
  - 2,500+ courses
  - Lecture videos, notes, assignments
  - All MIT subjects
- **Coverage**: Engineering, Science, Management, Humanities
- **Integration Complexity**: MEDIUM
- **Notes**: High-quality university content. Can link to courses.

### Coursera (Audit Option)
- **URL**: https://www.coursera.org/
- **Type**: Website
- **Cost**: FREE (audit mode)
- **Data Available**:
  - 5,000+ courses (audit for free)
  - Video lectures
  - Reading materials
- **Coverage**: All academic and professional subjects
- **Integration Complexity**: MEDIUM
- **Notes**: Audit mode allows free access to video content.

### edX (Audit Option)
- **URL**: https://www.edx.org/
- **Type**: Website
- **Cost**: FREE (audit mode)
- **Data Available**:
  - 3,000+ courses
  - University-level content
  - MIT, Harvard, Berkeley courses
- **Coverage**: All academic subjects
- **Integration Complexity**: MEDIUM
- **Notes**: Similar to Coursera with free audit option.

---

## 3. FREE ARTICLES & DOCUMENTATION

### Dev.to API
- **URL**: https://developers.forem.com/api
- **Type**: REST API
- **Cost**: FREE
- **Data Available**:
  - Programming articles
  - Tutorials
  - Tags and categories
  - User posts
- **Rate Limit**: 3,000 requests/hour
- **Coverage**: Programming, Web Development, DevOps
- **Integration Complexity**: LOW
- **Notes**: Excellent API. Can fetch articles by tag.

### Hashnode
- **URL**: https://hashnode.com/
- **Type**: GraphQL API
- **Cost**: FREE
- **Data Available**:
  - Tech blog posts
  - Tutorials
  - Developer content
- **Coverage**: Programming, Technology
- **Integration Complexity**: MEDIUM
- **Notes**: GraphQL API available.

### Medium (Limited)
- **URL**: https://medium.com/
- **Type**: RSS Feeds / Limited API
- **Cost**: FREE (some articles)
- **Data Available**:
  - Articles (metered)
  - Tech content
- **Coverage**: Technology, Business, Self-improvement
- **Integration Complexity**: HIGH
- **Notes**: Limited free access. RSS feeds available for publications.

### MDN Web Docs
- **URL**: https://developer.mozilla.org/
- **Type**: Website / GitHub
- **Cost**: FREE
- **Data Available**:
  - Web development documentation
  - Tutorials
  - References
- **Coverage**: HTML, CSS, JavaScript, Web APIs
- **Integration Complexity**: MEDIUM
- **Notes**: Content is on GitHub. Can scrape or use archived versions.

### W3Schools
- **URL**: https://www.w3schools.com/
- **Type**: Website
- **Cost**: FREE
- **Data Available**:
  - Tutorials
  - References
  - Examples
- **Coverage**: Web Technologies
- **Integration Complexity**: MEDIUM
- **Notes**: Very popular for beginners. Could link to tutorials.

### GeeksforGeeks
- **URL**: https://www.geeksforgeeks.org/
- **Type**: Website
- **Cost**: FREE
- **Data Available**:
  - 100,000+ articles
  - Tutorials
  - Practice problems
- **Coverage**: Programming, Algorithms, Data Structures, CS
- **Integration Complexity**: MEDIUM
- **Notes**: Very comprehensive for computer science.

---

## 4. ACADEMIC & RESEARCH PAPERS

### arXiv API
- **URL**: https://arxiv.org/help/api
- **Type**: REST API
- **Cost**: FREE
- **Data Available**:
  - 2+ million academic papers
  - Physics, Math, CS, Biology, etc.
  - Abstracts and PDF links
- **Rate Limit**: 1 request per 3 seconds
- **Coverage**: Physics, Mathematics, Computer Science, Biology
- **Integration Complexity**: LOW
- **Notes**: Excellent for advanced learners. Has proper API.

### PubMed Central (NCBI)
- **URL**: https://www.ncbi.nlm.nih.gov/pmc/
- **Type**: REST API (Entrez)
- **Cost**: FREE
- **Data Available**:
  - Biomedical literature
  - Full-text articles
  - Abstracts
- **Coverage**: Medicine, Biology, Health Sciences
- **Integration Complexity**: MEDIUM
- **Notes**: API requires registration. Great for medical/bio content.

### DOAJ (Directory of Open Access Journals)
- **URL**: https://doaj.org/api/docs
- **Type**: REST API
- **Cost**: FREE
- **Data Available**:
  - 19,000+ journals
  - 10+ million articles
  - Open access academic papers
- **Coverage**: All academic subjects
- **Integration Complexity**: LOW
- **Notes**: All content is open access. Great API.

### PLOS ONE
- **URL**: https://www.plos.org/
- **Type**: Website / API
- **Cost**: FREE (open access)
- **Data Available**:
  - Scientific articles
  - Research papers
- **Coverage**: Science, Medicine
- **Integration Complexity**: MEDIUM
- **Notes**: All articles are free to read.

---

## 5. VIDEO CONTENT (Beyond YouTube)

### TED Talks API
- **URL**: https://www.ted.com/participate/developer
- **Type**: REST API (limited)
- **Cost**: FREE
- **Data Available**:
  - 3,000+ TED talks
  - Transcripts
  - Topics and tags
- **Coverage**: Ideas, Technology, Science, Society
- **Integration Complexity**: MEDIUM
- **Notes**: Inspiring educational content. Can embed videos.

### Vimeo (Educational)
- **URL**: https://developer.vimeo.com/
- **Type**: REST API
- **Cost**: FREE tier available
- **Data Available**:
  - Educational videos
  - Documentaries
  - Tutorials
- **Coverage**: Various subjects
- **Integration Complexity**: MEDIUM
- **Notes**: Has educational content separate from YouTube.

### Crash Course (YouTube)
- **URL**: https://www.youtube.com/c/crashcourse
- **Type**: YouTube (already integrated)
- **Cost**: FREE
- **Data Available**:
  - Educational series
  - History, Science, Literature, etc.
- **Coverage**: Academic subjects
- **Integration Complexity**: LOW (YouTube API already integrated)
- **Notes**: Already covered by YouTube integration.

---

## 6. PODCASTS

### Listen Notes API
- **URL**: https://www.listennotes.com/api/
- **Type**: REST API
- **Cost**: FREE tier (1,000 requests/month)
- **Data Available**:
  - 3+ million podcasts
  - 180+ million episodes
  - Educational content filter
- **Coverage**: All subjects
- **Integration Complexity**: LOW
- **Notes**: Great for finding educational podcasts. Has good free tier.

---

## 7. CODE & PROGRAMMING RESOURCES

### GitHub Repositories
- **URL**: https://docs.github.com/en/rest
- **Type**: REST API
- **Cost**: FREE
- **Data Available**:
  - Open source projects
  - Documentation
  - Learning resources
- **Coverage**: Programming, Software Development
- **Integration Complexity**: MEDIUM
- **Notes**: Can feature starred educational repositories.

### Stack Overflow
- **URL**: https://api.stackexchange.com/
- **Type**: REST API
- **Cost**: FREE
- **Data Available**:
  - Q&A content
  - Tagged questions
  - Technical explanations
- **Coverage**: Programming, Technology
- **Integration Complexity**: MEDIUM
- **Notes**: Great for programming Q&A and tutorials.

### Codecademy (Free Tier)
- **URL**: https://www.codecademy.com/
- **Type**: Website
- **Cost**: FREE tier available
- **Data Available**:
  - Interactive courses
  - Free content
- **Coverage**: Programming, Web Development
- **Integration Complexity**: MEDIUM
- **Notes**: Some free courses available.

---

## 8. SPECIALIZED LEARNING PLATFORMS

### Duolingo (Languages)
- **URL**: https://www.duolingo.com/
- **Type**: Website / Unofficial API
- **Cost**: FREE tier
- **Data Available**:
  - Language courses
  - Lessons
- **Coverage**: Languages
- **Integration Complexity**: HIGH (unofficial API)
- **Notes**: Popular for language learning.

### Wikipedia API
- **URL**: https://www.mediawiki.org/wiki/API:Main_page
- **Type**: REST API
- **Cost**: FREE
- **Data Available**:
  - Encyclopedia articles
  - Images
  - References
- **Coverage**: All subjects
- **Integration Complexity**: LOW
- **Notes**: Excellent for general knowledge. Well-documented API.

### Wikibooks
- **URL**: https://en.wikibooks.org/
- **Type**: Website / MediaWiki API
- **Cost**: FREE
- **Data Available**:
  - Free textbooks
  - How-to guides
  - Manuals
- **Coverage**: All subjects
- **Integration Complexity**: LOW
- **Notes**: Open-content textbooks.

### Wikiversity
- **URL**: https://en.wikiversity.org/
- **Type**: Website / MediaWiki API
- **Cost**: FREE
- **Data Available**:
  - Learning resources
  - Courses
  - Research projects
- **Coverage**: All academic subjects
- **Integration Complexity**: LOW
- **Notes**: Learning-focused Wikimedia project.

---

## RECOMMENDED PRIORITY INTEGRATION

### HIGH PRIORITY (Easy to integrate, high value):

1. **Open Library API** - Millions of free books, good API
2. **arXiv API** - Academic papers, excellent API
3. **Dev.to API** - Programming articles, excellent free API
4. **Wikipedia API** - General knowledge, very easy to use
5. **DOAJ API** - Academic journals, open access

### MEDIUM PRIORITY (Good value, moderate effort):

6. **Khan Academy (YouTube)** - Educational videos via existing YouTube integration
7. **MIT OpenCourseWare** - University content, linking
8. **freeCodeCamp** - Programming tutorials
9. **TED Talks** - Inspiring content
10. **Project Gutenberg** - Classic literature

### LOWER PRIORITY (Complex or limited free access):

11. **Google Books API** - Limited free tier
12. **Coursera/edX** - Requires linking only
13. **Listen Notes** - Podcasts (new content type)
14. **Stack Overflow** - Q&A content
15. **GitHub** - Code repositories

---

## NEW RESOURCE TYPES TO CONSIDER

Based on this research, we could add these new resource types:

1. **Academic Paper** - arXiv, PubMed, DOAJ
2. **Podcast** - Listen Notes API
3. **Documentation** - MDN, W3Schools
4. **Course** - Coursera, edX, freeCodeCamp (links)
5. **Tutorial** - Dev.to, Hashnode, GeeksforGeeks
6. **Classic Book** - Project Gutenberg, Open Library
7. **Textbook** - OpenStax
8. **Encyclopedia** - Wikipedia

---

## IMPLEMENTATION CONSIDERATIONS

### API Keys Needed:
- Google Books API (optional, has free tier)
- Listen Notes API (free tier available)
- Most others are free without keys

### Caching Strategy:
- Academic papers (arXiv, DOAJ) - Cache for 1 week
- Books (Open Library) - Cache for 1 day
- Articles (Dev.to) - Cache for 1 hour
- Wikipedia - Cache for 1 day

### Database Schema Updates:
- Add `source` field (youtube, arxiv, openlibrary, devto, wikipedia, etc.)
- Add `externalId` field for deduplication
- Consider `fullTextUrl` for papers

---

## ESTIMATED RESOURCE COUNT AFTER INTEGRATION

| Source | Estimated Resources |
|--------|---------------------|
| Current Database | 62 |
| Open Library (curated) | 1,000+ |
| arXiv (curated) | 500+ |
| Dev.to (curated) | 500+ |
| Wikipedia (featured) | 200+ |
| DOAJ (curated) | 300+ |
| Project Gutenberg | 500+ |
| Khan Academy (YouTube) | 200+ |
| **Total Estimate** | **3,000+** |

---

*Research completed: March 2024*
*Next step: Decide which sources to implement first*
