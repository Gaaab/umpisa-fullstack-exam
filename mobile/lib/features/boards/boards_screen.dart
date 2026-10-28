import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme.dart';
import '../../widgets/action_sheet.dart';
import '../../widgets/avatar.dart';
import '../../widgets/form_sheet.dart';
import '../../widgets/large_title_view.dart';
import '../../widgets/states.dart';
import '../auth/auth_controller.dart';
import 'board.dart';
import 'board_name_form.dart';
import 'boards_providers.dart';
import 'boards_repository.dart';

class BoardsScreen extends ConsumerWidget {
  const BoardsScreen({super.key});

  Future<void> _newBoard(BuildContext context, WidgetRef ref) async {
    final created = await showFormSheet<bool>(
      context,
      title: 'New board',
      builder: (_) => BoardNameForm(
        submitLabel: 'Create board',
        onSubmit: (name) async {
          await ref.read(boardsRepositoryProvider).createBoard(name);
          ref.invalidate(boardsProvider);
        },
      ),
    );
    if (created == true && context.mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Board created')));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final boards = ref.watch(boardsProvider);

    return Scaffold(
      body: LargeTitleView(
        title: 'Boards',
        onRefresh: () => ref.refresh(boardsProvider.future),
        actions: [
          IconButton(
            tooltip: 'New board',
            icon: const Icon(Icons.add_rounded),
            onPressed: () => _newBoard(context, ref),
          ),
          const _AccountButton(),
          const SizedBox(width: 4),
        ],
        slivers: [
          switch (boards) {
            AsyncError() => SliverFillRemaining(
              hasScrollBody: false,
              child: ErrorState(
                message: "Couldn't load boards. Check your connection and try again.",
                onRetry: () => ref.invalidate(boardsProvider),
              ),
            ),
            AsyncValue(:final value?) when value.isEmpty => SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                message: 'No boards yet. Create one to start planning.',
                actionLabel: 'New board',
                onAction: () => _newBoard(context, ref),
              ),
            ),
            AsyncValue(:final value?) => SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
              sliver: SliverList.separated(
                itemCount: value.length,
                itemBuilder: (_, index) => _BoardTile(value[index]),
                separatorBuilder: (_, _) => const SizedBox(height: 12),
              ),
            ),
            _ => const SliverFillRemaining(
              hasScrollBody: false,
              child: Center(child: CircularProgressIndicator.adaptive()),
            ),
          },
        ],
      ),
    );
  }
}

class _BoardTile extends StatelessWidget {
  const _BoardTile(this.board);

  final Board board;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final open = board.openTaskCount;

    return Material(
      color: AppColors.paper,
      borderRadius: const BorderRadius.all(Radius.circular(10)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => context.go('/boards/${board.id}'),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 8, 14),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      board.name,
                      style: text.titleMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${board.owner.name} · '
                      '${open == 0 ? 'No open tasks' : '$open open'}',
                      style: text.bodySmall,
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.graphite,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AccountButton extends ConsumerWidget {
  const _AccountButton();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider.select((auth) => auth.value));
    if (user == null) return const SizedBox.shrink();

    return IconButton(
      tooltip: 'Account',
      icon: Avatar(user.name, size: 32),
      onPressed: () async {
        final signOut = await showActionSheet<bool>(
          context,
          title: user.name,
          message: user.email,
          actions: const [SheetAction('Sign out', true, destructive: true)],
        );
        if (signOut == true) {
          await ref.read(authControllerProvider.notifier).logout();
        }
      },
    );
  }
}
