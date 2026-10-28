import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/theme.dart';
import '../../widgets/loading_button.dart';
import '../auth/user.dart';
import '../boards/boards_providers.dart';
import 'assignee_field.dart';

/// "Add task" sheet body. Pops with true once the task is created.
class AddTaskForm extends ConsumerStatefulWidget {
  const AddTaskForm({super.key, required this.boardId});

  final String boardId;

  @override
  ConsumerState<AddTaskForm> createState() => _AddTaskFormState();
}

class _AddTaskFormState extends ConsumerState<AddTaskForm> {
  final _formKey = GlobalKey<FormState>();
  final _title = TextEditingController();
  final _description = TextEditingController();
  User? _assignee;
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref
          .read(boardProvider(widget.boardId).notifier)
          .addTask(
            title: _title.text.trim(),
            description: _description.text.trim(),
            assigneeId: _assignee?.id,
          );
      if (mounted) Navigator.pop(context, true);
    } catch (error) {
      if (mounted) {
        setState(() {
          _saving = false;
          _error = error.toString();
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextFormField(
            controller: _title,
            // Wraps long titles; return still submits, never adds a newline.
            minLines: 1,
            maxLines: 3,
            textInputAction: TextInputAction.done,
            autofocus: true,
            maxLength: 120,
            textCapitalization: TextCapitalization.sentences,
            decoration: const InputDecoration(labelText: 'Title'),
            validator: (value) => (value == null || value.trim().isEmpty)
                ? 'Task title is required'
                : null,
          ),
          const SizedBox(height: 4),
          TextFormField(
            controller: _description,
            minLines: 3,
            maxLines: 6,
            textCapitalization: TextCapitalization.sentences,
            inputFormatters: [LengthLimitingTextInputFormatter(2000)],
            decoration: const InputDecoration(
              labelText: 'Description (optional)',
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 16),
          AssigneeField(
            value: _assignee,
            onChanged: (user) => setState(() => _assignee = user),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.brick),
              ),
            ),
          const SizedBox(height: 20),
          LoadingButton(
            label: 'Add task',
            loading: _saving,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
