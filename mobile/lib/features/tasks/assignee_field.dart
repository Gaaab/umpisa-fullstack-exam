import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../widgets/action_sheet.dart';
import '../auth/user.dart';
import 'tasks_providers.dart';

/// Read-only field that picks a teammate (or nobody) from an action sheet.
class AssigneeField extends ConsumerWidget {
  const AssigneeField({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final User? value;
  final ValueChanged<User?> onChanged;

  Future<void> _pick(BuildContext context, WidgetRef ref) async {
    final List<User> users;
    try {
      users = await ref.read(usersProvider.future);
    } catch (_) {
      ref.invalidate(usersProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Couldn't load teammates. Try again in a moment."),
          ),
        );
      }
      return;
    }
    if (!context.mounted) return;
    // Wrapped in a record so "Unassigned" differs from a cancelled sheet.
    final picked = await showActionSheet<({User? user})>(
      context,
      title: 'Assign to',
      actions: [
        const SheetAction('Unassigned', (user: null)),
        for (final user in users) SheetAction(user.name, (user: user)),
      ],
    );
    if (picked != null) onChanged(picked.user);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Starts loading teammates before the first tap.
    ref.watch(usersProvider.select((_) => null));

    return InkWell(
      borderRadius: const BorderRadius.all(Radius.circular(8)),
      onTap: () => _pick(context, ref),
      child: InputDecorator(
        decoration: const InputDecoration(
          labelText: 'Assignee',
          suffixIcon: Icon(Icons.unfold_more_rounded),
        ),
        child: Text(value?.name ?? 'Unassigned'),
      ),
    );
  }
}
