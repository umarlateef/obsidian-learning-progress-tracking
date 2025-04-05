# Learning Progress Plugin Architecture Design

## Overview

The Learning Progress Plugin will track learning progress through linked notes, visualize knowledge gaps, and monitor completion of subtopics. It integrates with Obsidian's native note-taking functionality, using regular notes as learning topics and subtopics.

## Core Components

### 1. Data Model

#### Topic Note Structure
```yaml
---
type: topic
progress: 0.5 # Calculated automatically based on completed subtopics
subtopics:
  - "[[Subtopic 1]]"
  - "[[Subtopic 2]]"
  - "[[Subtopic 3]]"
total_subtopics: 3
completed_subtopics: 1
---
```

#### Subtopic Note Structure
```yaml
---
type: subtopic
parent: "[[Main Topic]]"
completed: true # or false
completion_date: 2025-04-05 # Optional, added when marked complete
---
```

### 2. Plugin Components

#### ProgressManager
- Responsible for calculating and updating progress
- Monitors changes to subtopic completion status
- Updates topic note frontmatter with progress information

#### NoteMonitor
- Listens for note creation, modification, and deletion events
- Detects when notes are opened in the editor
- Identifies topic and subtopic relationships

#### ProgressRenderer
- Renders progress information in notes
- Creates progress bars and completion indicators
- Highlights completed and incomplete subtopics

#### KnowledgeMapView
- Creates a visual map of all topics and their progress
- Highlights knowledge gaps (topics with low progress)
- Provides interactive navigation to topics

### 3. User Interface Elements

#### Topic Note Template
- Command to create a new topic note with proper frontmatter
- Automatically adds progress tracking section

#### Subtopic Completion Toggle
- Button in subtopic notes to mark as complete/incomplete
- Updates parent topic progress automatically

#### Progress Status Bar
- Visual indicator of progress in topic notes
- Shows percentage of completed subtopics

#### Knowledge Map
- Global view of all learning topics
- Color-coded by progress (red = low progress, green = high progress)
- Size indicates number of subtopics

## Workflow

1. User creates a topic note (e.g., "AWS S3")
2. User creates subtopic notes linked to the topic (e.g., "S3 Buckets", "S3 Access Control")
3. As user completes learning subtopics, they mark them as complete
4. Plugin automatically updates progress in the parent topic note
5. Knowledge map shows overall learning progress and highlights gaps

## Technical Implementation

### Event Listeners
```typescript
// Monitor active note changes
this.registerEvent(
  app.workspace.on('active-leaf-change', (leaf) => {
    // Update UI based on current note
  })
);

// Monitor note modifications
this.registerEvent(
  app.vault.on('modify', (file) => {
    // Check if completion status changed
  })
);
```

### Progress Calculation
```typescript
calculateProgress(topicFile: TFile): number {
  const metadata = app.metadataCache.getFileCache(topicFile);
  const subtopics = getSubtopicsFromMetadata(metadata);
  
  if (subtopics.length === 0) return 0;
  
  const completedCount = subtopics.filter(isCompleted).length;
  return completedCount / subtopics.length;
}
```

### Frontmatter Updates
```typescript
updateTopicProgress(topicFile: TFile, progress: number): void {
  // Read existing content
  const content = await app.vault.read(topicFile);
  
  // Parse and update frontmatter
  const updatedContent = updateFrontmatterInContent(content, {
    progress,
    completed_subtopics: completedCount,
    total_subtopics: subtopics.length
  });
  
  // Write back to file
  await app.vault.modify(topicFile, updatedContent);
}
```

## User Experience Considerations

1. **Non-intrusive**: Works with existing notes without requiring special syntax
2. **Automatic**: Progress updates happen automatically when subtopics are completed
3. **Visual**: Clear visual indicators of progress and knowledge gaps
4. **Flexible**: Works with any topic structure and organization
5. **Integrated**: Feels like a natural extension of Obsidian's functionality
