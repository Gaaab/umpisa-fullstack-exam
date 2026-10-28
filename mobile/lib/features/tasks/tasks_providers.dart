import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/user.dart';
import 'task.dart';
import 'tasks_repository.dart';

final taskProvider = FutureProvider.autoDispose.family<Task, String>(
  (ref, id) => ref.watch(tasksRepositoryProvider).task(id),
);

final myTasksProvider = FutureProvider.autoDispose<List<Task>>(
  (ref) => ref.watch(tasksRepositoryProvider).myTasks(),
);

final usersProvider = FutureProvider.autoDispose<List<User>>(
  (ref) => ref.watch(tasksRepositoryProvider).users(),
);
