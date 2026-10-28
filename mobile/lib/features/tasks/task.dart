import 'dart:ui';

import '../auth/user.dart';

/// API value, label and DESIGN.md hues for each status, kept in one place.
enum TaskStatus {
  todo(
    'TODO',
    'To do',
    edge: Color(0xFF64748B),
    tint: Color(0xFFEEF1F5),
    text: Color(0xFF3F4A5C),
  ),
  inProgress(
    'IN_PROGRESS',
    'In progress',
    edge: Color(0xFFE09A1A),
    tint: Color(0xFFFDF1DC),
    text: Color(0xFF7A4B00),
  ),
  done(
    'DONE',
    'Done',
    edge: Color(0xFF2E7D4F),
    tint: Color(0xFFE3F2E8),
    text: Color(0xFF1F5C39),
  );

  const TaskStatus(
    this.value,
    this.label, {
    required this.edge,
    required this.tint,
    required this.text,
  });

  final String value;
  final String label;
  final Color edge;
  final Color tint;
  final Color text;

  static TaskStatus parse(String value) =>
      values.firstWhere((status) => status.value == value);
}

class Task {
  const Task({
    required this.id,
    required this.title,
    required this.status,
    this.description,
    this.assignee,
    this.boardId,
    this.boardName,
    this.comments = const [],
    this.createdAt,
    this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    final assignee = json['assignee'] as Map<String, dynamic>?;
    final board = json['board'] as Map<String, dynamic>?;
    final createdAt = json['createdAt'] as String?;
    final updatedAt = json['updatedAt'] as String?;
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      status: TaskStatus.parse(json['status'] as String),
      description: json['description'] as String?,
      assignee: assignee == null ? null : User.fromJson(assignee),
      boardId: board?['id'] as String?,
      boardName: board?['name'] as String?,
      comments: [
        for (final comment in json['comments'] as List? ?? const [])
          Comment.fromJson(comment as Map<String, dynamic>),
      ],
      createdAt: createdAt == null ? null : DateTime.parse(createdAt),
      updatedAt: updatedAt == null ? null : DateTime.parse(updatedAt),
    );
  }

  final String id;
  final String title;
  final TaskStatus status;
  final String? description;
  final User? assignee;
  final String? boardId;
  final String? boardName;
  final List<Comment> comments;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Task copyWith({TaskStatus? status}) => Task(
    id: id,
    title: title,
    status: status ?? this.status,
    description: description,
    assignee: assignee,
    boardId: boardId,
    boardName: boardName,
    comments: comments,
    createdAt: createdAt,
    updatedAt: updatedAt,
  );
}

class Comment {
  const Comment({
    required this.id,
    required this.body,
    required this.author,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) => Comment(
    id: json['id'] as String,
    body: json['body'] as String,
    author: User.fromJson(json['author'] as Map<String, dynamic>),
    createdAt: DateTime.parse(json['createdAt'] as String),
  );

  final String id;
  final String body;
  final User author;
  final DateTime createdAt;
}

class TaskAssignment {
  const TaskAssignment({
    required this.taskId,
    required this.title,
    required this.assignedBy,
  });

  factory TaskAssignment.fromJson(Map<String, dynamic> json) {
    final task = json['task'] as Map<String, dynamic>;
    return TaskAssignment(
      taskId: task['id'] as String,
      title: task['title'] as String,
      assignedBy:
          (json['assignedBy'] as Map<String, dynamic>)['name'] as String,
    );
  }

  final String taskId;
  final String title;
  final String assignedBy;
}
