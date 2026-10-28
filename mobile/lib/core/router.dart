import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/auth_controller.dart';
import '../features/auth/login_screen.dart';
import '../features/boards/board_screen.dart';
import '../features/boards/boards_screen.dart';
import '../features/tasks/my_tasks_screen.dart';
import '../features/tasks/task_detail_screen.dart';
import 'home_shell.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier(0);
  ref.listen(authControllerProvider, (_, _) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      final auth = ref.read(authControllerProvider);
      // Stay put while the stored session or a login request resolves.
      if (auth.isLoading && !auth.hasValue) return null;

      final location = state.matchedLocation;
      if (auth.value == null) return location == '/login' ? null : '/login';
      if (location == '/login' || location == '/') return '/boards';
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (_, _) => const Scaffold(
          body: Center(child: CircularProgressIndicator.adaptive()),
        ),
      ),
      GoRoute(path: '/login', builder: (_, _) => const LoginScreen()),
      StatefulShellRoute.indexedStack(
        builder: (_, _, shell) => HomeShell(shell: shell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/boards',
                builder: (_, _) => const BoardsScreen(),
                routes: [
                  GoRoute(
                    path: ':id',
                    builder: (_, state) =>
                        BoardScreen(id: state.pathParameters['id']!),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/my-tasks',
                builder: (_, _) => const MyTasksScreen(),
              ),
            ],
          ),
        ],
      ),
      // Outside the shell so it covers the tab bar from either tab.
      GoRoute(
        path: '/tasks/:id',
        builder: (_, state) =>
            TaskDetailScreen(id: state.pathParameters['id']!),
      ),
    ],
  );
});
