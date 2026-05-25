"""
COVENANT.md — bilateral binding illustration.

Design from first principles: COVENANT.md is a *contract*, not a pipeline.
Two parties — Skill (producer) and Consumer (caller) — both bind themselves to
a single document that declares the five things every well-designed skill must
answer: domain, interface, dependencies, contracts, quality.

Rendered at 2x then downsampled to 1200x630 for crisp typography on LinkedIn.
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

# ---- Output target (LinkedIn landscape) ------------------------------------
W, H = 1200, 630
SCALE = 2  # supersample for sharpness
CW, CH = W * SCALE, H * SCALE

OUT_PATH = "/sessions/trusting-gallant-bell/mnt/development/covenant-md/docs/assets/covenant-md-binding.png"

# ---- Palette ---------------------------------------------------------------
BG_TOP      = (10, 13, 18)        # deep blue-black
BG_BOT      = (13, 17, 23)        # github dark
INK         = (201, 209, 217)     # primary text
MUTED       = (139, 148, 158)     # captions
DIM         = (110, 118, 129)     # role labels

# document — warm parchment in dark
DOC_FILL    = (28, 22, 14)
DOC_BORDER  = (212, 168, 87)      # gold
DOC_KEY     = (230, 195, 120)     # gold-ish for YAML keys
DOC_VALUE   = (232, 220, 196)     # warm off-white for values
DOC_PUNCT   = (160, 138, 96)      # dim gold punctuation
DOC_HEADER  = (212, 168, 87)

# parties
SKILL_FILL    = (12, 22, 32)
SKILL_BORDER  = (109, 180, 232)   # soft blue
SKILL_NAME    = (148, 198, 232)
SKILL_LINE    = (109, 180, 232)

CONSUMER_FILL    = (22, 16, 32)
CONSUMER_BORDER  = (178, 136, 255) # soft purple
CONSUMER_NAME    = (200, 168, 255)
CONSUMER_LINE    = (178, 136, 255)

# seal
SEAL_FILL   = (138, 56, 48)       # deep crimson wax
SEAL_RING   = (212, 168, 87)
SEAL_TEXT   = (232, 220, 196)

# ---- Fonts -----------------------------------------------------------------
FDIR_DEJ  = "/usr/share/fonts/truetype/dejavu"
FDIR_LIB  = "/usr/share/fonts/truetype/liberation"

def F(path, size):
    return ImageFont.truetype(path, size * SCALE)

font_title       = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 40)
font_subtitle    = F(f"{FDIR_DEJ}/DejaVuSans.ttf", 16)
font_role        = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 10)
font_party_name  = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 20)
font_party_clause= F(f"{FDIR_DEJ}/DejaVuSans.ttf", 13)
font_doc_header  = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 14)
font_doc_key     = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 15)
font_doc_value   = F(f"{FDIR_DEJ}/DejaVuSansMono.ttf", 13)
font_doc_caption = F(f"{FDIR_DEJ}/DejaVuSans-Oblique.ttf", 11)
font_seal_top    = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 9)
font_seal_main   = F(f"{FDIR_DEJ}/DejaVuSansMono-Bold.ttf", 11)
font_caption     = F(f"{FDIR_DEJ}/DejaVuSans-Oblique.ttf", 14)
font_arrow_label = F(f"{FDIR_DEJ}/DejaVuSansMono.ttf", 10)

# ---- Canvas ---------------------------------------------------------------
img = Image.new("RGB", (CW, CH), BG_BOT)
d = ImageDraw.Draw(img, "RGBA")

# subtle vertical gradient
for y in range(CH):
    t = y / CH
    r = int(BG_TOP[0] * (1 - t) + BG_BOT[0] * t)
    g = int(BG_TOP[1] * (1 - t) + BG_BOT[1] * t)
    b = int(BG_TOP[2] * (1 - t) + BG_BOT[2] * t)
    d.line([(0, y), (CW, y)], fill=(r, g, b))

# very faint radial vignette darker corners
vignette = Image.new("L", (CW, CH), 0)
vd = ImageDraw.Draw(vignette)
for i, alpha in enumerate(range(0, 60, 2)):
    inset = i * 14
    vd.rectangle([inset, inset, CW - inset, CH - inset], outline=alpha)
vignette = vignette.filter(ImageFilter.GaussianBlur(40 * SCALE / 2))
overlay = Image.new("RGB", (CW, CH), (0, 0, 0))
img = Image.composite(overlay, img, vignette)
d = ImageDraw.Draw(img, "RGBA")

# ---- Helpers --------------------------------------------------------------
def s(x): return x * SCALE

def text_w(text, font):
    bbox = d.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]

def text_h(text, font):
    bbox = d.textbbox((0, 0), text, font=font)
    return bbox[3] - bbox[1]

def rrect(xy, radius, fill=None, outline=None, width=1):
    d.rounded_rectangle(xy, radius=s(radius), fill=fill, outline=outline, width=s(width))

def line(p1, p2, fill, width=1):
    d.line([p1, p2], fill=fill, width=s(width))

# ---- Title ----------------------------------------------------------------
title = "COVENANT.md"
tw = text_w(title, font_title)
d.text(((CW - tw) // 2, s(30)), title, fill=DOC_HEADER, font=font_title)

sub = "the design contract between a skill and its caller"
sw = text_w(sub, font_subtitle)
d.text(((CW - sw) // 2, s(80)), sub, fill=MUTED, font=font_subtitle)

# subtle horizontal rule under the title
line((s(420), s(110)), (s(780), s(110)), fill=(48, 54, 61), width=1)

# ---- Layout positions ----------------------------------------------------
# Center document
DOC_W, DOC_H = 460, 380
DOC_X = (CW - s(DOC_W)) // 2
DOC_Y = s(140)

# Left party (Skill)
PARTY_W, PARTY_H = 230, 180
SKILL_X = s(40)
SKILL_Y = DOC_Y + s(60)

# Right party (Consumer)
CONS_X = CW - s(40) - s(PARTY_W)
CONS_Y = DOC_Y + s(60)

# ---- Connector lines from parties to document (drawn behind) -----------
# Skill -> document (blue, fading toward gold near doc)
skill_anchor = (SKILL_X + s(PARTY_W), SKILL_Y + s(PARTY_H // 2))
doc_left_anchor = (DOC_X, DOC_Y + s(DOC_H // 2))

# Draw a graceful curve via small segments simulating bezier with two control points
def smooth_line(p1, p2, color_start, color_end, steps=80, width=2):
    cx1 = (p1[0] + p2[0]) // 2
    cx2 = (p1[0] + p2[0]) // 2
    # cubic-ish: linear horizontal
    prev = p1
    for i in range(1, steps + 1):
        t = i / steps
        # ease in/out
        et = t * t * (3 - 2 * t)
        x = int(p1[0] + (p2[0] - p1[0]) * et)
        y = int(p1[1] + (p2[1] - p1[1]) * t)
        r = int(color_start[0] * (1 - t) + color_end[0] * t)
        g = int(color_start[1] * (1 - t) + color_end[1] * t)
        b = int(color_start[2] * (1 - t) + color_end[2] * t)
        d.line([prev, (x, y)], fill=(r, g, b), width=s(width))
        prev = (x, y)

smooth_line(skill_anchor, doc_left_anchor, SKILL_LINE, DOC_BORDER, width=2)

cons_anchor = (CONS_X, CONS_Y + s(PARTY_H // 2))
doc_right_anchor = (DOC_X + s(DOC_W), DOC_Y + s(DOC_H // 2))
smooth_line(cons_anchor, doc_right_anchor, CONSUMER_LINE, DOC_BORDER, width=2)

# Arrowheads at the document end (gold, pointing in)
def arrow_tip(tip, direction, color):
    # tip = (x, y); direction = 'right' (pointing right, i.e. tip on right)
    h = s(7)
    if direction == 'right':
        pts = [tip, (tip[0] - h, tip[1] - h), (tip[0] - h, tip[1] + h)]
    else:
        pts = [tip, (tip[0] + h, tip[1] - h), (tip[0] + h, tip[1] + h)]
    d.polygon(pts, fill=color)

# Arrowheads sit just outside the document edge, pointing IN
# Skill → doc.left  : arrow tip on doc.left edge, base extends leftward (points right)
# Consumer → doc.right : arrow tip on doc.right edge, base extends rightward (points left)
arrow_tip(doc_left_anchor,  'right', DOC_BORDER)
arrow_tip(doc_right_anchor, 'left',  DOC_BORDER)

# ---- Party blocks (drawn on top of connectors) --------------------------
def draw_party(x, y, w, h, role, name, fill, border, name_color, clauses):
    rrect((x, y, x + s(w), y + s(h)), radius=14, fill=fill, outline=border, width=2)
    # role label
    d.text((x + s(20), y + s(16)), role, fill=DIM, font=font_role)
    # name
    d.text((x + s(20), y + s(38)), name, fill=name_color, font=font_party_name)
    # subtle separator
    line((x + s(20), y + s(76)), (x + s(w - 20), y + s(76)), fill=(48, 54, 61), width=1)
    # clauses
    cy = y + s(90)
    for clause in clauses:
        d.text((x + s(20), cy), clause, fill=INK, font=font_party_clause)
        cy += s(22)

draw_party(SKILL_X, SKILL_Y, PARTY_W, PARTY_H,
           "PARTY A · PRODUCER", "Skill",
           SKILL_FILL, SKILL_BORDER, SKILL_NAME,
           ["binds itself to deliver",
            "every operation declared",
            "in interface.surface.",
            "no more, no less."])

draw_party(CONS_X, CONS_Y, PARTY_W, PARTY_H,
           "PARTY B · CALLER", "Consumer",
           CONSUMER_FILL, CONSUMER_BORDER, CONSUMER_NAME,
           ["binds itself to call",
            "only what is declared",
            "and to honour the",
            "contracts as written."])

# ---- The covenant document (center) -------------------------------------
# document panel with gold border
rrect((DOC_X, DOC_Y, DOC_X + s(DOC_W), DOC_Y + s(DOC_H)),
      radius=12, fill=DOC_FILL, outline=DOC_BORDER, width=2)

# inner inset frame (very thin)
inset = s(10)
rrect((DOC_X + inset, DOC_Y + inset,
       DOC_X + s(DOC_W) - inset, DOC_Y + s(DOC_H) - inset),
      radius=8, outline=(80, 64, 36), width=1)

# document header band
hdr_y = DOC_Y + s(22)
d.text((DOC_X + s(28), hdr_y), "─── THE COVENANT ───", fill=DOC_HEADER, font=font_doc_header)
hdr_caption = "five questions every skill must answer"
d.text((DOC_X + s(28), hdr_y + s(20)), hdr_caption, fill=MUTED, font=font_doc_caption)

# divider line under header
line((DOC_X + s(28), DOC_Y + s(70)),
     (DOC_X + s(DOC_W - 28), DOC_Y + s(70)),
     fill=(80, 64, 36), width=1)

# Five sections as YAML lines with annotations
sections = [
    ("domain:",       "who are you?"),
    ("interface:",    "what do you expose?"),
    ("dependencies:", "what do you need?"),
    ("contracts:",    "what do you promise?"),
    ("quality:",      "how do you prove it?"),
]

sec_y = DOC_Y + s(92)
for key, question in sections:
    # gold key
    d.text((DOC_X + s(34), sec_y), key, fill=DOC_KEY, font=font_doc_key)
    # right-aligned annotation in dim italic
    qw = text_w(question, font_doc_caption)
    d.text((DOC_X + s(DOC_W - 28) - qw, sec_y + s(3)),
           question, fill=DOC_VALUE, font=font_doc_caption)
    sec_y += s(38)

# Divider above the seal
line((DOC_X + s(28), DOC_Y + s(DOC_H - 78)),
     (DOC_X + s(DOC_W - 28), DOC_Y + s(DOC_H - 78)),
     fill=(80, 64, 36), width=1)

# ---- Wax seal --------------------------------------------------------
seal_cx = DOC_X + s(DOC_W // 2)
seal_cy = DOC_Y + s(DOC_H - 40)
seal_r  = s(28)

# outer ring
d.ellipse((seal_cx - seal_r, seal_cy - seal_r,
           seal_cx + seal_r, seal_cy + seal_r),
          fill=SEAL_FILL, outline=SEAL_RING, width=s(2))
# inner ring
d.ellipse((seal_cx - seal_r + s(6), seal_cy - seal_r + s(6),
           seal_cx + seal_r - s(6), seal_cy + seal_r - s(6)),
          outline=SEAL_RING, width=s(1))

# seal text — top arc-ish (we'll just stack two centred lines)
seal_top = "BOUND BY"
stw = text_w(seal_top, font_seal_top)
d.text((seal_cx - stw // 2, seal_cy - s(11)), seal_top, fill=SEAL_TEXT, font=font_seal_top)
seal_main = "v1.0"
smw = text_w(seal_main, font_seal_main)
d.text((seal_cx - smw // 2, seal_cy + s(1)), seal_main, fill=SEAL_TEXT, font=font_seal_main)

# Signature lines on either side of the seal
# left signature
sig_y = seal_cy
line((DOC_X + s(40), sig_y), (seal_cx - s(40), sig_y), fill=SKILL_BORDER, width=1)
d.text((DOC_X + s(40), sig_y + s(6)), "skill signature", fill=DIM, font=font_arrow_label)
# right signature
line((seal_cx + s(40), sig_y), (DOC_X + s(DOC_W - 40), sig_y), fill=CONSUMER_BORDER, width=1)
sig_label_r = "consumer signature"
slw = text_w(sig_label_r, font_arrow_label)
d.text((DOC_X + s(DOC_W - 40) - slw, sig_y + s(6)),
       sig_label_r, fill=DIM, font=font_arrow_label)

# ---- Top-left corner ornament -----------------------------------------
# small COVENANT version tag
tag = "v1.0 · spec"
d.text((s(40), s(40)), tag, fill=DIM, font=font_arrow_label)

# Top-right corner tag
right_tag = "skill design contract"
rtw = text_w(right_tag, font_arrow_label)
d.text((CW - s(40) - rtw, s(40)), right_tag, fill=DIM, font=font_arrow_label)

# ---- Bottom caption ---------------------------------------------------
caption = "every skill is a promise.  a promise needs paper."
cw_b = text_w(caption, font_caption)
d.text(((CW - cw_b) // 2, CH - s(50)), caption, fill=MUTED, font=font_caption)

# tiny footer
foot = "COVENANT.md  ·  v1.0 spec  ·  public release imminent"
fw = text_w(foot, font_arrow_label)
d.text(((CW - fw) // 2, CH - s(28)), foot, fill=DIM, font=font_arrow_label)

# ---- Resize to target ------------------------------------------------
final = img.resize((W, H), Image.LANCZOS)
final.save(OUT_PATH, "PNG", optimize=True)
print(f"Wrote {OUT_PATH}")
print(f"Size: {os.path.getsize(OUT_PATH)} bytes")
