import json
import re
from pathlib import Path

RAW_DOC = """
Detailed Daily Planner: Week 1
Day 1: Introduction to Self, Size, and Vertical Strokes
I. Circle Time: Introduction to Body Awareness
Learning Goal: Engage children with a physical rhyme to build auditory skills and basic body part recognition
.
Activity: Rhyme – Head, Shoulders, Knees, and Toes
.
Detailed Procedure: The teacher leads the students in singing the rhyme slowly, demonstrating how to touch the corresponding body parts (head, shoulders, knees, toes) as they are named. This builds gross motor skills and helps children follow physical cues.
II. Literacy: Introduction to Standing Line
Learning Goal: Introduce the first pre-writing stroke, the vertical "Standing Line"
.
Concept: A standing line goes straight up and down.
Detailed Procedure & Activity: Demonstrate drawing a straight vertical line on the board. Then, transition to the English skillbook activity where students trace over the standing lines. The worksheet provides a visual of falling leaves from a tree, with dotted vertical lines descending from the leaves. Instruct students to trace from top to bottom
.
III. Numeracy: Introduction to Pre-Math Concept – Big and Small
Learning Goal: Introduce size differentiation and comparison
.
Concept: Understanding the visual difference between large (big) and small objects.
Detailed Procedure: Use classroom objects (like a large book and a small book) to demonstrate the concept visually. Emphasize the vocabulary "Big" and "Small" clearly so students begin associating the words with the physical scale.
IV. General Awareness (EVS): Introduction to "All About Me"
Learning Goal: Encourage self-recognition and personal identity
.
Concept: Knowing basic personal facts.
Detailed Procedure & Activity: Conduct an oral session asking simple questions such as "What is your name?" and "What is your age?"
. Encourage each child to speak loudly and confidently.

--------------------------------------------------------------------------------
Day 2: Reinforcement of Standing Lines and Size Discrimination
I. Circle Time: Revisit Rhyme
Activity: Revisit – Head, Shoulders, Knees, and Toes
.
Detailed Procedure: Sing the rhyme again, this time increasing the speed slightly to make it a fun, energetic physical activity that tests their recall and coordination.
II. Literacy: Revisit Standing Line
Activity: Revisit – Standing Line
.
Detailed Procedure: Continue practicing the vertical stroke. Ensure students are holding their crayons correctly and tracing the dotted lines downwards to build muscle memory
.
III. Numeracy: Revisit Big and Small
Activity: Revisit – Big and Small
.
Detailed Procedure & Activity: Move to the Maths skillbook application. Guide students through the visual discrimination tasks. Instruct them to "Circle the big objects" (using examples from the book like the big box and the large teddy bear) and "Circle the small objects" (like the small soccer ball and the small blue hat)
.
IV. General Awareness (EVS): Revisit All About Me
Activity: Revisit – All About Me
.
Detailed Procedure & Activity: Expand on self-identity by discussing their personal preferences. Ask oral questions like "Name your favourite toy"
. This encourages children to express their individual likes within a group setting.

--------------------------------------------------------------------------------
Day 3: Introduction to Sleeping Lines and Genders
I. Circle Time: Introduction to Story
Learning Goal: Introduce narrative listening, attention span, and moral comprehension
.
Activity: Intro – Story: The Tortoise and the Rabbit
.
Detailed Procedure: Read the story aloud to the class. Introduce the two main characters (the slow tortoise and the fast rabbit) and describe the setting of the race.
II. Literacy: Introduction to Sleeping Line
Learning Goal: Introduce the horizontal pre-writing stroke
.
Concept: A sleeping line goes across from left to right.
Detailed Procedure & Activity: Demonstrate the horizontal stroke. In the English skillbook, have students trace over the sleeping lines. This activity uses fun associations, asking children to trace the dotted horizontal line to connect animals to their homes: linking the bee to the beehive, the lion to the den, and the dog to the kennel
.
III. Numeracy: Revisit Big and Small
Activity: Revisit – Big and Small
.
Detailed Procedure: Continue assessing their grasp of size. Use oral questioning and point-and-identify methods, asking students to "Point to the big object" when shown contrasting images (e.g., a big teddy bear next to a small one)
.
IV. General Awareness (EVS): Introduction to Genders
Learning Goal: Identify biological gender categories
.
Concept: Differentiating between a boy and a girl.
Detailed Procedure & Activity: Ask the children, "Are you a boy or a girl?"
. Follow up with a worksheet activity where students look at pictures of children and "Tick (✔) below" the image that matches their own gender (a picture of a girl reading, or a boy with a backpack)
.

--------------------------------------------------------------------------------
Day 4: Application and Story Comprehension
I. Circle Time: Revisit Story
Activity: Revisit – The Tortoise and the Rabbit
.
Detailed Procedure: Recap the plot of the story. Discuss the ending and the moral lesson of the story, emphasizing that taking your time and not giving up is better than rushing and being careless.
II. Literacy: Revisit Sleeping Line
Activity: Revisit – Sleeping Line
.
Detailed Procedure & Activity: Continue the matching activity from Day 3, tracing horizontal lines from left to right. Have them connect the bird to the nest, the horse to the stable, and the girl to the house
. Focus on keeping the crayon on the dotted line.
III. Numeracy: Revisit Big and Small
Activity: Revisit – Big and Small
.
Detailed Procedure: Consolidate the size concept through a physical classroom activity. Ask students to sort mixed items (like blocks or toy cars) into a "Big" pile and a "Small" pile.
IV. General Awareness (EVS): Revisit Genders
Activity: Revisit – Genders
.
Detailed Procedure: Further discuss differences and similarities between boys and girls. You can use visual aids of clothing items (like a skirt, dress, shirt, and shorts) to discuss different types of clothes children wear
.

--------------------------------------------------------------------------------
Day 5: Synthesis and Fine Motor Art
I. Circle Time: Synthesis
Activity: Revisit – Rhyme and Story
.
Detailed Procedure: Have a final, enthusiastic group performance of the Head, Shoulders, Knees, and Toes rhyme. Ask students to recall their favourite part of The Tortoise and the Rabbit.
II. Literacy: Revisit Standing and Sleeping Line
Activity: Revisit – Standing and Sleeping Line
.
Detailed Procedure: Combine both strokes. Have children practice drawing a simple shape, like a window or a ladder, which requires them to use both top-to-bottom (standing) and left-to-right (sleeping) motions.
III. Numeracy: Revisit Big and Small - Activity
Activity: Revisit – Big and Small - Activity
.
Detailed Procedure: Conduct a final review activity, perhaps pointing out big and small objects around the actual classroom (e.g., the big teacher's desk vs. a small chair).
IV. General Awareness (EVS): Revisit All About Me, and Genders
Activity: Revisit – All about me, and Genders
.
Detailed Procedure: Bring the week's themes together by having children introduce themselves to the class: "My name is [Name], I am [Age] years old, and I am a [Boy/Girl]".
V. Art and Craft: Hand Painting
Learning Goal: Sensory engagement and introduction to primary colours
.
Activity: Activity – Hand Painting
.
Detailed Procedure: Introduce the Primary Colour RED
. Instruct the children to "Paint your hand red and make a palm print" on their art pages
. This messy, fun activity develops tactile senses while solidifying colour recognition.

"""


def format_label_line(line: str) -> str:
    cleaned = line.lstrip('•').strip()
    if ':' not in cleaned:
        return cleaned
    label, rest = cleaned.split(':', 1)
    return f"^{label.strip()}:^ {rest.strip()}"


def format_bullet_line(line: str, level: int = 1) -> str:
    content = line.strip()
    return f"{'*' * level} {content}"


def normalize_line(line: str) -> str:
    return line.replace('\u2022', '•')


def build_lessons() -> tuple[dict, int]:
    days = {}
    current_day = None
    current_week = 1
    day_offset = 0
    current_section_title = None
    current_section_lines = []

    def flush_section():
        nonlocal current_section_title, current_section_lines
        if current_day is None or current_section_title is None:
            return
        day_lessons = days.setdefault(current_day, [])
        content_lines = []
        for line in current_section_lines:
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith('•'):
                content_lines.append(format_label_line(line))
            elif re.match(r'^[\d◦•]+\.', stripped):
                content_lines.append(format_bullet_line(stripped))
            elif stripped.startswith('◦'):
                content_lines.append(format_bullet_line(stripped[1:].strip(), level=2))
            else:
                content_lines.append(stripped)
        content_text = "\n".join(content_lines).strip()
        day_lessons.append(
            {
                "title": current_section_title,
                "content": content_text,
                "video": "",
                "doc": "",
                "image": "",
                "time": "20 minutes"
            }
        )
        current_section_title = None
        current_section_lines = []

    for raw_line in RAW_DOC.splitlines():
        line = normalize_line(raw_line)
        if not line.strip():
            continue
        if match := re.match(r"Detailed Daily Planner: Week (\d+)", line):
            flush_section()
            current_week = int(match.group(1))
            day_offset = (current_week - 1) * 5
            continue
        if match := re.match(r"Day\s+(\d+):\s+(.+)", line):
            flush_section()
            raw_day = int(match.group(1))
            current_day = str(raw_day + day_offset)
            continue
        if match := re.match(r"^[IVX]+\. (.+)", line):
            flush_section()
            current_section_title = match.group(1).strip()
            current_section_lines = []
            continue
        if line.startswith("--------------------------------------------------------------------------------"):
            flush_section()
            current_day = None
            current_section_title = None
            current_section_lines = []
            continue
        if current_section_title:
            current_section_lines.append(line)

    flush_section()

    return (
        {
            "Nursery": {
                "months": {
                    "1": {
                        "days": {
                            day: {
                                "lessons": lessons
                            }
                            for day, lessons in days.items()
                        }
                    }
                }
            },
            "LKG": {"months": {}},
            "UKG": {"months": {}},
        },
        current_week,
    )


def main():
    data, week_number = build_lessons()
    repo_root = Path(__file__).resolve().parent.parent
    output_path = repo_root / "src" / "lessons.json"
    output_path.write_text(json.dumps(data, indent=2))
    week_path = repo_root / "src" / f"week{week_number}_lessons.json"
    week_path.write_text(json.dumps({"week": week_number, **data}, indent=2))


if __name__ == "__main__":
    main()
