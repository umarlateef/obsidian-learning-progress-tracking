# Obsidian Learning Progress Plugin

A plugin for Obsidian that helps you track your learning progress through linked notes, visualize knowledge gaps, and monitor completion of subtopics.

## Features

- **Topic and Subtopic Organization**: Create topic notes (like "AWS S3") and link subtopic notes (like "S3 Buckets") for organized learning
- **Progress Tracking**: Automatically calculate progress based on completed subtopics
- **Knowledge Gap Visualization**: See a visual map of your learning topics with progress indicators
- **Subtopic Tracker**: Monitor all your learning topics and subtopics in one view
- **Progress Reports**: Generate detailed progress reports for your learning journey
- **Completion Toggling**: Mark subtopics as complete/incomplete with automatic progress updates

## How It Works

The plugin works with regular Obsidian notes:

1. **Topic Notes**: Main learning areas with progress tracking
2. **Subtopic Notes**: Individual learning items linked to their parent topic
3. **Automatic Progress**: As you complete subtopics, parent topics show updated progress
4. **Visual Map**: See your entire learning landscape with knowledge gaps highlighted

## Getting Started

### Creating a Topic

1. Use the command palette (`Ctrl+P`) and select "Learning Progress: Create Topic Note"
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
3. The subtopic will be marked as complete and the parent topic's progress will update automatically

### Viewing Progress

1. Click the graduation cap icon in the ribbon to open the Subtopic Tracker
2. Use the "Show Knowledge Map" command to see a visual representation of your learning progress
3. Open topic notes to see detailed progress information

## Views

### Subtopic Tracker

The Subtopic Tracker provides a comprehensive view of all your learning topics and subtopics. It includes:

- Progress bars for each topic
- Completion status for subtopics
- Filters for viewing all topics, in-progress topics, or completed topics
- Quick access to toggle completion status

### Knowledge Map

The Knowledge Map visualizes your learning landscape:

- Topics shown as nodes with size based on number of subtopics
- Color indicates progress level (red = low progress, green = high progress)
- Opacity increases with progress (more transparent = less progress)
- Click on nodes to open the corresponding topic note

## Commands

- **Create Topic Note**: Create a new learning topic
- **Create Subtopic Note**: Create a new subtopic linked to the current topic
- **Toggle Subtopic Completion**: Mark a subtopic as complete or incomplete
- **Show Subtopic Tracker**: Open the Subtopic Tracker view
- **Show Knowledge Map**: Open the Knowledge Map visualization

## Settings

- **Show Progress Bar**: Toggle visibility of progress bars in topic notes
- **Show Knowledge Map**: Toggle visibility of the Knowledge Map in the sidebar
- **Topic Template**: Customize the template for new topic notes
- **Subtopic Template**: Customize the template for new subtopic notes

## Tips for Effective Use

1. **Break Down Topics**: Divide large learning areas into manageable subtopics
2. **Regular Updates**: Mark subtopics as complete as you learn them
3. **Review Knowledge Map**: Regularly check your knowledge map to identify gaps
4. **Link Related Topics**: Create connections between related topics using standard Obsidian links
5. **Add Notes**: Use the notes section in subtopics to record key learnings
