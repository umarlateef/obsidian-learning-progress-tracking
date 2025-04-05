# User Guide

This guide will help you get the most out of the Learning Progress Plugin for Obsidian.

## Core Concepts

The Learning Progress Plugin is built around these key concepts:

- **Topics**: Main learning areas you want to master (e.g., "AWS S3", "JavaScript", "Machine Learning")
- **Subtopics**: Specific components of a topic that you need to learn (e.g., "S3 Buckets", "Arrow Functions", "Linear Regression")
- **Progress**: Automatically calculated based on completed subtopics
- **Knowledge Map**: Visual representation of your learning landscape

## Workflow

### 1. Create a Topic

Start by creating a topic for a subject you want to learn:

1. Use the command palette (`Ctrl+P`) and select "Learning Progress: Create Topic Note"
2. Enter a name for your learning topic (e.g., "AWS S3")
3. A new note will be created with the following structure:

```markdown
---
type: topic
progress: 0
subtopics: []
total_subtopics: 0
completed_subtopics: 0
---

# AWS S3

## Progress

0% complete

## Subtopics

```

### 2. Add Subtopics

Break down your topic into subtopics:

1. Open your topic note
2. Use the command palette and select "Learning Progress: Create Subtopic Note"
3. Enter a name for your subtopic (e.g., "S3 Buckets")
4. A new subtopic note will be created with the following structure:

```markdown
---
type: subtopic
parent: "[[AWS S3]]"
completed: false
---

# S3 Buckets

Status: ❌ Not completed

## Notes

```

The subtopic will automatically be linked to the parent topic, and the parent topic will be updated to include the subtopic in its list.

### 3. Track Your Learning

As you learn each subtopic:

1. Open the subtopic note
2. Use the command palette and select "Learning Progress: Toggle Subtopic Completion"
3. The subtopic will be marked as complete:

```markdown
---
type: subtopic
parent: "[[AWS S3]]"
completed: true
completion_date: 2025-04-05
---

# S3 Buckets

Status: ✅ Completed

## Notes

```

The parent topic will automatically update its progress based on the number of completed subtopics.

### 4. Monitor Your Progress

There are several ways to monitor your learning progress:

1. **Subtopic Tracker**: Click the graduation cap icon in the ribbon to open the Subtopic Tracker, which shows all your topics and their progress
2. **Knowledge Map**: Use the "Show Knowledge Map" command to see a visual representation of your learning landscape
3. **Topic Notes**: Open any topic note to see its current progress and a list of subtopics with their completion status

## Advanced Features

### Customizing Templates

You can customize the templates for topic and subtopic notes in the plugin settings:

1. Go to Settings > Plugin Options > Learning Progress
2. Modify the templates to suit your needs
3. Use `{{title}}` as a placeholder for the note title
4. Use `{{parent}}` as a placeholder for the parent topic name (in subtopic templates)

### Generating Reports

To create a detailed progress report:

1. Open a topic note
2. Use the progress information and subtopic list to track your learning journey
3. The plugin automatically keeps these up to date as you complete subtopics

### Organizing Your Learning

For effective learning management:

1. **Group Related Topics**: Create folder structures in Obsidian to organize related topics
2. **Link Between Topics**: Use standard Obsidian links to connect related topics and subtopics
3. **Add Detailed Notes**: Use the notes section in subtopics to record key learnings
4. **Review Regularly**: Check your Knowledge Map regularly to identify areas that need attention

## Keyboard Shortcuts

You can assign keyboard shortcuts to common commands:

1. Go to Settings > Hotkeys
2. Search for "Learning Progress"
3. Assign shortcuts to frequently used commands like "Toggle Subtopic Completion"

## Tips and Best Practices

1. **Break Down Complex Topics**: Divide large learning areas into manageable subtopics
2. **Be Consistent**: Use the plugin for all your learning to get a complete picture
3. **Update Regularly**: Mark subtopics as complete as soon as you've learned them
4. **Review Knowledge Gaps**: Use the Knowledge Map to identify areas that need attention
5. **Add Context**: Include notes, resources, and links in your subtopic notes
6. **Track Dependencies**: Note prerequisites in your subtopic notes to create a learning path
