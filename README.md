Outline Owl
An AI-driven Socratic Dramaturg for Narrative Engineering.

Outline-Owl is a specialized web application designed to help screenwriters stress-test their story logic. Unlike standard generative AI tools that "write for you," Outline-Owl acts as an investigative partner. It utilizes a dual-model architecture to interrogate the writer's intent while simultaneously extracting and structuring narrative data in the background.

Technical Stack
Framework: Next.js (App Router)

Language: TypeScript for type-safe state management.

Styling: Tailwind CSS (Custom Dark-Mode UI).

Database & Auth: Supabase (PostgreSQL with Row Level Security).

AI Orchestration: Anthropic API (Claude 4.6 Sonnet & 4.5 Haiku).

Deployment: Vercel.

Core Architecture
1. The Socratic Engine
The primary interface utilizes Claude 3.5 Sonnet programmed with a strict "investigative" persona. Using advanced system prompting, the engine is constrained to never offer creative suggestions. Instead, it identifies narrative gaps—such as weak character motivations ("The Wound") or inconsistent world-building—and forces the user to resolve them through dialogue.

2. The "Shadow Secretary" (Autonomous Extraction)
A secondary Claude 3.5 Haiku model runs asynchronously. As the user engages with the Dramaturg, this model parses the unstructured chat history to identify and extract key story metadata.

Input: Raw conversational text.

Output: Structured JSON objects representing plot points, character traits, and thematic elements.

3. Real-time Data Persistence
Leveraging Supabase, the application manages a persistent storage layer for extracted story facts.

Security: Implemented Row Level Security (RLS) to ensure all creative intellectual property is scoped strictly to the authenticated user.

Efficiency: Used serverless API routes to handle the handoff between the AI provider and the PostgreSQL database, ensuring low-latency updates.

Narrative Logic & Engineering
This project was built to solve the "Act II Slump" by applying rigorous logical analysis to creative writing. By treating narrative beats as structured data points, the application helps writers maintain a consistent "Story Bible" through automated documentation.

The underlying logic focuses on:

Character Causality: Ensuring every action is a direct result of the protagonist's established flaw.

Structural Integrity: Tracking the introduction and resolution of narrative "plants" and "payoffs."

Installation & Setup
Clone the repository:

Bash
git clone https://github.com/YOUR_USERNAME/Outline-Owl.git
Install dependencies:

Bash
npm install
Environment Variables:
Create a .env.local file and add your credentials:

Plaintext
ANTHROPIC_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
Run the development server:

Bash
npm run dev
Roadmap
Visual Story-Mapping: Integrating a canvas-based view to visualize the relationship between extracted plot points.

Multi-Model Benchmarking: Testing extraction accuracy between different LLM providers to optimize for latency vs. narrative nuance.

Export Functionality: Direct export of structured outlines into industry-standard script formats (.fdx, .pdf).
