import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:taskboard/app.dart';
import 'package:taskboard/core/graphql_client.dart';
import 'package:taskboard/core/router.dart';
import 'package:taskboard/core/token_storage.dart';
import 'package:taskboard/features/auth/auth_repository.dart';
import 'package:taskboard/features/auth/user.dart';
import 'package:taskboard/features/boards/board.dart';
import 'package:taskboard/features/boards/board_activity.dart';
import 'package:taskboard/features/boards/boards_repository.dart';
import 'package:taskboard/features/tasks/task.dart';
import 'package:taskboard/features/tasks/task_assigned.dart';
import 'package:taskboard/features/tasks/tasks_repository.dart';

const alice = User(id: 'u1', name: 'Alice Santos', email: 'alice@example.com');
const bob = User(id: 'u2', name: 'Bob Reyes', email: 'bob@example.com');

class MemoryTokenStorage implements TokenStorage {
  String? token;

  @override
  Future<String?> read() async => token;
  @override
  Future<void> write(String value) async => token = value;
  @override
  Future<void> clear() async => token = null;
}

class FakeAuthRepository implements AuthRepository {
  @override
  Future<({String token, User user})> login(
    String email,
    String password,
  ) async {
    if (password != 'password123') {
      throw const AuthException('Invalid email or password');
    }
    return (token: 'jwt', user: alice);
  }

  @override
  Future<void> logout() async {}

  @override
  Future<User> me() async => alice;
}

/// In-memory API behind both repositories, signed in as [alice]. Like the
/// real server it announces every change on [events]; tests call its methods
/// directly to act as a teammate on another phone.
class FakeApi implements BoardsRepository, TasksRepository {
  FakeApi({List<Board>? boards, List<Task>? tasks})
    : _boards = boards ?? [websiteBoard, mobileBoard],
      tasks = tasks ?? seedTasks();

  static const websiteBoard = Board(
    id: 'b1',
    name: 'Website relaunch',
    owner: alice,
    openTaskCount: 0,
  );
  static const mobileBoard = Board(
    id: 'b2',
    name: 'Mobile app beta',
    owner: bob,
    openTaskCount: 0,
  );

  static List<Task> seedTasks() => [
    _task('t1', 'Draft homepage copy', TaskStatus.todo, assignee: alice),
    _task('t2', 'Pick a hosting plan', TaskStatus.todo, assignee: bob),
    _task('t3', 'Build pricing page', TaskStatus.inProgress, assignee: alice),
    _task('t4', 'Set up analytics', TaskStatus.done, assignee: alice),
    _task('t5', 'Beta invite list', TaskStatus.todo, board: mobileBoard),
  ];

  static Task _task(
    String id,
    String title,
    TaskStatus status, {
    User? assignee,
    Board board = websiteBoard,
    List<Comment> comments = const [],
  }) => Task(
    id: id,
    title: title,
    status: status,
    assignee: assignee,
    boardId: board.id,
    boardName: board.name,
    comments: comments,
    createdAt: DateTime.utc(2026, 10, 1),
    updatedAt: DateTime.utc(2026, 10, 2),
  );

  final List<Board> _boards;
  final List<Task> tasks;
  final events = StreamController<BoardEvent>.broadcast();

  /// When set, task updates wait for it. Updates to [rejectedTasks] fail.
  Completer<void>? holdUpdates;
  final rejectedTasks = <String>{};

  Board _withTasks(Board board) {
    final boardTasks = [
      for (final task in tasks)
        if (task.boardId == board.id) task,
    ];
    return Board(
      id: board.id,
      name: board.name,
      owner: board.owner,
      openTaskCount: boardTasks
          .where((task) => task.status != TaskStatus.done)
          .length,
      tasks: boardTasks,
    );
  }

  Task _find(String id) => tasks.firstWhere(
    (task) => task.id == id,
    orElse: () => throw const ApiException('Task not found'),
  );

  void _put(Task task) =>
      tasks[tasks.indexWhere((existing) => existing.id == task.id)] = task;

  @override
  Future<List<Board>> boards() async => [
    for (final board in _boards) _withTasks(board).copyWith(tasks: const []),
  ];

  @override
  Future<Board> board(String id) async =>
      _withTasks(_boards.firstWhere((board) => board.id == id));

  @override
  Future<Board> createBoard(String name) async {
    final board = Board(
      id: 'b${_boards.length + 1}',
      name: name,
      owner: alice,
      openTaskCount: 0,
    );
    _boards.insert(0, board);
    events.add(BoardEvent(BoardEventType.boardCreated, board.id));
    return board;
  }

  @override
  Future<Board> updateBoard(String id, String name) async {
    final index = _boards.indexWhere((board) => board.id == id);
    events.add(BoardEvent(BoardEventType.boardUpdated, id));
    return _boards[index] = _boards[index].copyWith(name: name);
  }

  @override
  Future<void> deleteBoard(String id) async {
    _boards.removeWhere((board) => board.id == id);
    tasks.removeWhere((task) => task.boardId == id);
    events.add(BoardEvent(BoardEventType.boardDeleted, id));
  }

  @override
  Future<Task> task(String id) async => _find(id);

  @override
  Future<List<Task>> myTasks() async => [
    for (final task in tasks)
      if (task.assignee?.id == alice.id) task,
  ];

  @override
  Future<List<User>> users() async => const [alice, bob];

  @override
  Future<Task> createTask({
    required String boardId,
    required String title,
    String? description,
    String? assigneeId,
  }) async {
    final board = _boards.firstWhere((board) => board.id == boardId);
    final task = _task(
      't${tasks.length + 1}',
      title,
      TaskStatus.todo,
      assignee: const [alice, bob].where((u) => u.id == assigneeId).firstOrNull,
      board: board,
    );
    tasks.add(task);
    events.add(BoardEvent(BoardEventType.taskCreated, boardId, task.id));
    return task;
  }

  @override
  Future<Task> updateTask(String id, Map<String, Object?> changes) async {
    await holdUpdates?.future;
    if (rejectedTasks.contains(id)) throw const ApiException('Network error');
    final current = _find(id);
    final assigneeId = changes.containsKey('assigneeId')
        ? changes['assigneeId']
        : current.assignee?.id;
    final updated = Task(
      id: id,
      title: changes['title'] as String? ?? current.title,
      description: changes.containsKey('description')
          ? changes['description'] as String?
          : current.description,
      status: changes['status'] == null
          ? current.status
          : TaskStatus.parse(changes['status']! as String),
      assignee: const [alice, bob].where((u) => u.id == assigneeId).firstOrNull,
      boardId: current.boardId,
      boardName: current.boardName,
      comments: current.comments,
      createdAt: current.createdAt,
      updatedAt: DateTime.utc(2026, 10, 3),
    );
    _put(updated);
    events.add(BoardEvent(BoardEventType.taskUpdated, updated.boardId!, id));
    return updated;
  }

  @override
  Future<void> deleteTask(String id) async {
    final task = _find(id);
    tasks.remove(task);
    events.add(BoardEvent(BoardEventType.taskDeleted, task.boardId!, id));
  }

  @override
  Future<void> addComment(
    String taskId,
    String body, {
    User author = alice,
  }) async {
    final task = _find(taskId);
    _put(
      Task(
        id: task.id,
        title: task.title,
        status: task.status,
        description: task.description,
        assignee: task.assignee,
        boardId: task.boardId,
        boardName: task.boardName,
        comments: [
          ...task.comments,
          Comment(
            id: 'c${task.comments.length + 1}',
            body: body,
            author: author,
            createdAt: DateTime.utc(2026, 10, 4, 9),
          ),
        ],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      ),
    );
    events.add(BoardEvent(BoardEventType.commentAdded, task.boardId!, taskId));
  }
}

/// Pumps the whole app at an iPhone-sized viewport with fake data.
Future<FakeApi> pumpApp(
  WidgetTester tester, {
  FakeApi? api,
  bool signedIn = true,
}) async {
  api ??= FakeApi();
  tester.view
    ..physicalSize = const Size(1206, 2622)
    ..devicePixelRatio = 3;
  addTearDown(tester.view.reset);

  await tester.pumpWidget(
    ProviderScope(
      retry: (_, _) => null,
      overrides: [
        tokenStorageProvider.overrideWithValue(
          MemoryTokenStorage()..token = signedIn ? 'jwt' : null,
        ),
        authRepositoryProvider.overrideWithValue(FakeAuthRepository()),
        boardsRepositoryProvider.overrideWithValue(api),
        tasksRepositoryProvider.overrideWithValue(api),
        taskAssignedProvider.overrideWith((ref) => const Stream.empty()),
        boardActivityProvider.overrideWith((ref) => api!.events.stream),
      ],
      child: const TaskboardApp(),
    ),
  );
  await tester.pumpAndSettle();
  return api;
}

GoRouter router(WidgetTester tester) =>
    ProviderScope.containerOf(tester.element(find.byType(TaskboardApp)))
        .read(routerProvider);

/// Navigates like a user would from the current screen.
Future<void> visit(WidgetTester tester, String location) async {
  router(tester).go(location);
  await tester.pumpAndSettle();
}
