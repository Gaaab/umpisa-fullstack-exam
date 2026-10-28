import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../../widgets/loading_button.dart';

/// Board name form used by "New board" and "Rename". Pops with true once
/// [onSubmit] succeeds; shows the API error otherwise.
class BoardNameForm extends StatefulWidget {
  const BoardNameForm({
    super.key,
    required this.submitLabel,
    required this.onSubmit,
    this.initialName = '',
  });

  final String submitLabel;
  final Future<void> Function(String name) onSubmit;
  final String initialName;

  @override
  State<BoardNameForm> createState() => _BoardNameFormState();
}

class _BoardNameFormState extends State<BoardNameForm> {
  final _formKey = GlobalKey<FormState>();
  late final _name = TextEditingController(text: widget.initialName);
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await widget.onSubmit(_name.text.trim());
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
            controller: _name,
            autofocus: true,
            maxLength: 60,
            textCapitalization: TextCapitalization.sentences,
            textInputAction: TextInputAction.done,
            decoration: const InputDecoration(labelText: 'Board name'),
            validator: (value) => (value == null || value.trim().isEmpty)
                ? 'Board name is required'
                : null,
            onFieldSubmitted: (_) => _submit(),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                _error!,
                style: const TextStyle(color: AppColors.brick),
              ),
            ),
          const SizedBox(height: 8),
          LoadingButton(
            label: widget.submitLabel,
            loading: _saving,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}
