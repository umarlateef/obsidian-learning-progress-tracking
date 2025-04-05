# Obsidian Learning Progress Plugin

A plugin for Obsidian that helps you track your learning progress through notes, visualize knowledge gaps, and monitor your learning journey.

## Features

- **Topic and Subtopic Organization**: Create topic notes for subjects you want to learn (like AWS S3) and link subtopic notes to track specific areas of knowledge
- **Progress Tracking**: Mark subtopics as complete as you learn them and see automatic progress updates in parent topics
- **Knowledge Gap Visualization**: See which areas of knowledge need attention with visual indicators
- **Note-Based Learning**: Works with Obsidian's native note system - each topic and subtopic is a regular markdown note

## Installation

1. Download the latest release from the [Releases](https://github.com/yourusername/obsidian-learning-progress/releases) page
2. Extract the zip file to your Obsidian vault's plugins folder: `.obsidian/plugins/learning-progress-tracker/`
3. Enable the plugin in Obsidian's Community Plugins settings

## Usage

### Creating a Learning Topic

1. Use the command palette (Ctrl+P) and select "Learning Progress: Create Topic Note"
2. Enter a name for your learning topic (e.g., "AWS S3")
3. A new note will be created with the proper structure for tracking progress

### Adding Subtopics

1. Open a topic note
2. Use the command palette and select "Learning Progress: Create Subtopic Note"
3. Enter a name for your subtopic (e.g., "S3 Buckets")
4. A new subtopic note will be created and linked to the parent topic

### Tracking Progress

1. Open a subtopic note
2. Use the command palette and select "Learning Progress: Toggle Subtopic Completion"
3. The subtopic will be marked as complete/incomplete
4. The parent topic will automatically update its progress based on completed subtopics

### Viewing Progress

1. Open a topic note to see:
   - Overall progress percentage
   - List of subtopics with completion status (✅/❌)
2. Click the graduation cap icon in the ribbon to open the Subtopic Tracker view
3. Use the Knowledge Map view to visualize your learning landscape

## Screenshots

![Topic Note](screenshots/topic-note.png)
*A topic note showing progress and linked subtopics*

![Subtopic Tracker](screenshots/subtopic-tracker.png)
*The Subtopic Tracker view showing all learning topics*

![Knowledge Map](screenshots/knowledge-map.png)
*Knowledge Map visualization showing learning progress*

## Development

### Prerequisites

- Node.js and npm
- Obsidian development environment

### Building

1. Clone this repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`

### Testing

1. Copy the built files to your Obsidian test vault's plugins folder
2. Enable the plugin in Obsidian's settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The Obsidian team for creating an amazing knowledge management tool
- The Obsidian plugin community for inspiration and examples
