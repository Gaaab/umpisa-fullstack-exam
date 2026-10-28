import '../auth/user.dart';
import '../tasks/task.dart';

class Board {
  const Board({
    required this.id,
    required this.name,
    required this.owner,
    required this.openTaskCount,
    this.tasks = const [],
  });

  factory Board.fromJson(Map<String, dynamic> json) => Board(
    id: json['id'] as String,
    name: json['name'] as String,
    owner: User.fromJson(json['owner'] as Map<String, dynamic>),
    openTaskCount: json['openTaskCount'] as int,
    tasks: [
      for (final task in json['tasks'] as List? ?? const [])
        Task.fromJson(task as Map<String, dynamic>),
    ],
  );

  final String id;
  final String name;
  final User owner;
  final int openTaskCount;
  final List<Task> tasks;

  Board copyWith({String? name, List<Task>? tasks}) => Board(
    id: id,
    name: name ?? this.name,
    owner: owner,
    openTaskCount: openTaskCount,
    tasks: tasks ?? this.tasks,
  );
}
