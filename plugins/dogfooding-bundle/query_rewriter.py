# -*- coding: utf-8 -*-
"""Query rewriter for feedback command."""

import logging

logger = logging.getLogger(__name__)


class FeedbackQueryRewriter:
    """Rewrite /feedback queries to agent prompts."""

    @staticmethod
    def should_rewrite(query: str) -> bool:
        """Check if query should be rewritten.

        Args:
            query: User query

        Returns:
            True if query starts with /feedback
        """
        if not query:
            return False
        return query.strip().lower().startswith("/feedback")

    @staticmethod
    def rewrite(query: str) -> str:
        """Rewrite /feedback query to agent prompt.

        Args:
            query: Original query (e.g. "/feedback" or "/feedback xxx")

        Returns:
            Rewritten query for agent
        """
        # Remove /feedback prefix (case insensitive)
        query_lower = query.strip().lower()
        if query_lower.startswith("/feedback"):
            content = query[len("/feedback") :].strip()
        else:
            content = ""

        if content:
            # Quick mode with user content
            return FeedbackQueryRewriter._get_quick_mode_prompt(content)
        else:
            # Interactive mode
            return FeedbackQueryRewriter._get_interactive_mode_prompt()

    @staticmethod
    def _get_interactive_mode_prompt() -> str:
        """Get interactive mode prompt."""
        return """请帮我收集用户反馈。按以下步骤引导用户：

1. 首先询问用户对本次对话的评价：
   "感谢您的反馈！请对本次对话进行评价：
   1. 😞 糟糕
   2. 😐 一般
   3. 😊 优秀

   请回复数字 1-3 或直接回复"糟糕"/"一般"/"优秀""

2. 如果用户选择"糟糕"，询问具体问题（可多选）：
   "很抱歉没有达到您的期望。请选择主要问题：
   1. 没理解我的意图
   2. 任务没有完成
   3. 步骤太繁琐
   4. 结果有误
   5. 回复风格有问题
   6. 存在安全风险
   7. 响应太慢
   8. 其他

   请回复数字（如：1,3,4）或直接描述问题"

3. 询问补充说明（可选）：
   "感谢您的反馈。您可以补充说明具体问题吗？（可选，直接回复或输入"跳过"）"

4. **收集完成后，展示表格让用户确认**：
   "感谢您的详细反馈！请确认以下信息：

   | 项目 | 内容 |
   |------|------|
   | 评分 | [糟糕/一般/优秀] |
   | 问题分类 | [问题列表，如果有] |
   | 详细说明 | [用户补充的说明] |

   确认无误请回复"确认"或"提交"，需要修改请直接说明。"

5. **用户确认后提交**：
   "✅ 反馈已提交！

   反馈ID: FEEDBACK-[时间戳]

   感谢您的宝贵意见，我们会认真处理。现在可以继续之前的对话了。"

6. **退出反馈模式**：
   - 如果用户确认提交，反馈模式结束
   - 如果用户输入与反馈无关的内容（不是修改反馈信息），自动退出反馈模式，继续正常对话

请自然地引导用户完成这个流程，不要提及技术细节。"""

    @staticmethod
    def _get_quick_mode_prompt(content: str) -> str:
        """Get quick mode prompt with user content analysis.

        Args:
            content: User's feedback content

        Returns:
            Prompt for agent
        """
        return f"""用户提供了快速反馈："{content}"

请根据这个反馈内容，智能分析并引导用户完成完整的反馈表单：

1. **分析反馈内容**，判断可能的评分：
   - 如果包含负面词汇（如"错误"、"失败"、"不行"、"bug"、"有误"等）→ 可能是"糟糕"
   - 如果包含正面词汇（如"很好"、"完美"、"解决"、"满意"等）→ 可能是"优秀"
   - 其他 → 可能是"一般"

2. **预填评分**，向用户确认：
   "感谢您的反馈！根据您的描述，我理解您对本次对话的评价是：[预判的评分]

   这个评价准确吗？如果不准确，请告诉我正确的评价（糟糕/一般/优秀）"

3. **如果是"糟糕"评分**，根据反馈内容智能分析可能的问题类别：
   - 提到"不理解"、"误解"、"没懂" → 1. 没理解我的意图
   - 提到"未完成"、"没做"、"没实现" → 2. 任务没有完成
   - 提到"复杂"、"繁琐"、"麻烦" → 3. 步骤太繁琐
   - 提到"错误"、"bug"、"不对"、"有误" → 4. 结果有误
   - 提到"语气"、"态度"、"风格" → 5. 回复风格有问题
   - 提到"安全"、"风险"、"危险" → 6. 存在安全风险
   - 提到"慢"、"延迟"、"卡" → 7. 响应太慢

   向用户确认：
   "根据您的描述，我判断主要问题是：[预判的问题]

   这个判断准确吗？您还有其他问题要补充吗？"

4. **收集完成后，展示表格让用户确认**：
   "感谢您的详细反馈！请确认以下信息：

   | 项目 | 内容 |
   |------|------|
   | 评分 | [糟糕/一般/优秀] |
   | 问题分类 | [问题列表，如果有] |
   | 详细说明 | {content} |

   确认无误请回复"确认"或"提交"，需要修改请直接说明。"

5. **用户确认后提交**：
   "✅ 反馈已提交！

   反馈ID: FEEDBACK-[时间戳]

   感谢您的宝贵意见，我们会认真处理。现在可以继续之前的对话了。"

6. **退出反馈模式**：
   - 如果用户确认提交，反馈模式结束
   - 如果用户输入与反馈无关的内容（不是修改反馈信息），自动退出反馈模式，继续正常对话

请自然地引导用户，像正常对话一样，不要生硬地列出步骤。"""
