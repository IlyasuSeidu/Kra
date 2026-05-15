from kra_ai import allowed_launch_ai_surfaces


def test_launch_surfaces_are_staff_only_contracts() -> None:
    assert "support_policy_assistant" in allowed_launch_ai_surfaces
    assert "issue_summarization" in allowed_launch_ai_surfaces
    assert "internal_operational_faq" in allowed_launch_ai_surfaces

