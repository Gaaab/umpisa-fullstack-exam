import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/live_client.dart';
import '../tasks/tasks_providers.dart';
import 'boards_providers.dart';

enum BoardEventType {
  boardCreated('BOARD_CREATED'),
  boardUpdated('BOARD_UPDATED'),
  boardDeleted('BOARD_DELETED'),
  taskCreated('TASK_CREATED'),
  taskUpdated('TASK_UPDATED'),
  taskDeleted('TASK_DELETED'),
  commentAdded('COMMENT_ADDED');

  const BoardEventType(this.value);

  final String value;

  static BoardEventType parse(String value) =>
      values.firstWhere((type) => type.value == value);
}

/// A change anyone made, this client included. No `==` on purpose, so two
/// identical events in a row both refresh.
class BoardEvent {
  const BoardEvent(this.type, this.boardId, [this.taskId]);

  factory BoardEvent.fromJson(Map<String, dynamic> json) => BoardEvent(
    BoardEventType.parse(json['type'] as String),
    json['boardId'] as String,
    json['taskId'] as String?,
  );

  final BoardEventType type;
  final String boardId;
  final String? taskId;
}

final boardActivityProvider = StreamProvider.autoDispose<BoardEvent>(
  (ref) =>
      liveEvents(
        ref,
        'subscription BoardActivity { boardActivity { type boardId taskId } }',
      ).map(
        (data) =>
            BoardEvent.fromJson(data['boardActivity'] as Map<String, dynamic>),
      ),
);

/// Refetches whatever [event] touched. Deleted boards and tasks are not
/// refetched: screens showing them leave instead of flashing an error.
void syncBoardEvent(WidgetRef ref, BoardEvent event) {
  ref
    ..invalidate(boardsProvider)
    ..invalidate(myTasksProvider);
  if (event.type == BoardEventType.boardDeleted) return;
  ref.invalidate(boardProvider(event.boardId));
  if (event.taskId case final taskId?
      when event.type != BoardEventType.taskDeleted) {
    ref.invalidate(taskProvider(taskId));
  }
}
