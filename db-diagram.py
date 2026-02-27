#!/usr/bin/env python3
"""Generate a database schema diagram from the Prisma schema."""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

fig, ax = plt.subplots(1, 1, figsize=(20, 14))
ax.set_xlim(0, 20)
ax.set_ylim(0, 14)
ax.axis('off')
fig.patch.set_facecolor('#0e0e0e')

# Colors
BG      = '#1a1a2e'
HEADER  = '#6c3fc5'
TEXT    = '#e0e0e0'
FK      = '#ffcc00'
LINE    = '#555555'
PK      = '#33ff33'
ENUM_BG = '#2a1a3e'

def draw_table(x, y, w, title, fields):
    """Draw a table box. fields: list of (name, type, tag) where tag is 'PK','FK','','ENUM'."""
    h_header = 0.45
    h_row = 0.35
    h_total = h_header + h_row * len(fields)

    # Shadow
    ax.add_patch(mpatches.FancyBboxPatch((x+0.05, y-h_total-0.05), w, h_total,
        boxstyle="round,pad=0.1", facecolor='#000000', alpha=0.4))
    # Body
    ax.add_patch(mpatches.FancyBboxPatch((x, y-h_total), w, h_total,
        boxstyle="round,pad=0.1", facecolor=BG, edgecolor=LINE, linewidth=1.2))
    # Header
    ax.add_patch(mpatches.FancyBboxPatch((x, y-h_header), w, h_header,
        boxstyle="round,pad=0.1", facecolor=HEADER, edgecolor=LINE, linewidth=1.2))
    ax.text(x + w/2, y - h_header/2, title, ha='center', va='center',
            fontsize=11, fontweight='bold', color='white', family='monospace')

    for i, (name, typ, tag) in enumerate(fields):
        ry = y - h_header - h_row * i - h_row / 2
        color = PK if tag == 'PK' else (FK if tag == 'FK' else TEXT)
        prefix = ''
        if tag == 'PK': prefix = 'PK '
        elif tag == 'FK': prefix = 'FK '
        ax.text(x + 0.15, ry, f"{prefix}{name}", ha='left', va='center',
                fontsize=8.5, color=color, family='monospace', fontweight='bold' if tag else 'normal')
        ax.text(x + w - 0.15, ry, typ, ha='right', va='center',
                fontsize=8, color='#888888', family='monospace')

    return {
        'x': x, 'y': y, 'w': w, 'h': h_total,
        'left':  (x, y - h_header - h_row * len(fields) / 2),
        'right': (x + w, y - h_header - h_row * len(fields) / 2),
        'top':   (x + w/2, y),
        'bottom':(x + w/2, y - h_total),
    }

def draw_enum(x, y, w, title, values):
    h_header = 0.4
    h_row = 0.3
    h_total = h_header + h_row * len(values)
    ax.add_patch(mpatches.FancyBboxPatch((x, y-h_total), w, h_total,
        boxstyle="round,pad=0.08", facecolor=ENUM_BG, edgecolor='#6c3fc5', linewidth=1, linestyle='dashed'))
    ax.text(x + w/2, y - h_header/2, f'<<enum>> {title}', ha='center', va='center',
            fontsize=8.5, fontweight='bold', color='#b388ff', family='monospace')
    for i, v in enumerate(values):
        ry = y - h_header - h_row * i - h_row / 2
        ax.text(x + w/2, ry, v, ha='center', va='center',
                fontsize=8, color='#ce93d8', family='monospace')

def connect(t1, side1, t2, side2, label='', color=LINE, style='-'):
    p1 = t1[side1]
    p2 = t2[side2]
    ax.annotate('', xy=p2, xytext=p1,
        arrowprops=dict(arrowstyle='->', color=color, lw=1.2, linestyle=style, connectionstyle='arc3,rad=0.15'))
    if label:
        mx, my = (p1[0]+p2[0])/2, (p1[1]+p2[1])/2
        ax.text(mx, my+0.2, label, ha='center', va='center', fontsize=7, color=color, family='monospace')

# ── Tables ──

user = draw_table(7.5, 13.5, 4.5, 'user', [
    ('id',        'Int  @id autoincrement', 'PK'),
    ('email',     'String  @unique',        ''),
    ('googleId',  'String?  @unique',       ''),
    ('githubId',  'String?  @unique',       ''),
    ('password',  'String?',                ''),
    ('createdAt', 'DateTime  @default(now)',''),
])

profile = draw_table(0.3, 9.5, 4.5, 'profile', [
    ('userId',    'Int  @id',               'PK'),
    ('name',      'String',                 ''),
    ('avatarUrl', 'String  @default',       ''),
    ('bio',       'String?  @VarChar(255)', ''),
    ('level',     'Int  @default(1)',       ''),
    ('xp',        'Int  @default(0)',       ''),
])

achievement = draw_table(0.3, 5.8, 4.5, 'achievement', [
    ('id',         'Int  @id autoincrement', 'PK'),
    ('userId',     'Int',                    'FK'),
    ('type',       'String',                 ''),
    ('unlockedAt', 'DateTime  @default(now)',''),
])

match_t = draw_table(0.3, 3.5, 4.5, 'match', [
    ('id',            'Int  @id autoincrement', 'PK'),
    ('userId',        'Int',                    'FK'),
    ('guestName',     'String?',                ''),
    ('userScore',     'Int  @default(0)',       ''),
    ('opponentScore', 'Int  @default(0)',       ''),
    ('status',        'String  @default',       ''),
    ('createdAt',     'DateTime  @default(now)',''),
    ('completedAt',   'DateTime?',              ''),
    ('winPoints',     'Int  @default(5)',       ''),
    ('playMode',      'PlayMode  @default(AI)', ''),
    ('aiLevel',       'AiLevel  @default(EASY)',''),
    ('paddle',        'Paddle  @default(LEFT)', ''),
])

friends = draw_table(5.8, 8.5, 4.2, 'friends', [
    ('id',         'Int  @id autoincrement',  'PK'),
    ('senderId',   'Int',                     'FK'),
    ('receiverId', 'Int',                     'FK'),
    ('status',     'FriendStatus  @default',  ''),
    ('createdAt',  'DateTime  @default(now)', ''),
])

message_t = draw_table(5.8, 5.8, 4.2, 'message', [
    ('id',         'Int  @id autoincrement',  'PK'),
    ('senderId',   'Int',                     'FK'),
    ('receiverId', 'Int',                     'FK'),
    ('content',    'String  @db.Text',        ''),
    ('createdAt',  'DateTime  @default(now)', ''),
])

api_keys = draw_table(13, 9.5, 4.5, 'apiKeys', [
    ('id',        'Int  @id autoincrement',  'PK'),
    ('userId',    'Int',                     'FK'),
    ('name',      'String?',                ''),
    ('createdAt', 'DateTime  @default(now)', ''),
    ('expiresAt', 'DateTime?',              ''),
    ('hashedKey', 'String  @unique',        ''),
])

feedback = draw_table(13, 6.5, 4.5, 'feedback', [
    ('id',        'Int  @id autoincrement',  'PK'),
    ('userId',    'Int',                     'FK'),
    ('text',      'String  @VarChar(500)',   ''),
    ('createdAt', 'DateTime  @default(now)', ''),
])

# ── Enums ──

draw_enum(14, 4.5, 2.2, 'FriendStatus', ['PENDING', 'ACCEPTED'])
draw_enum(16.5, 4.5, 1.8, 'PlayMode', ['AI', 'LOCAL'])
draw_enum(14, 2.8, 2.2, 'AiLevel', ['EASY', 'MID', 'HARD'])
draw_enum(16.5, 2.8, 1.8, 'Paddle', ['LEFT', 'RIGHT'])

# ── Relations ──

connect(profile, 'right', user, 'left', '1:1', FK)
connect(match_t, 'right', user, 'left', 'N:1', FK)
connect(achievement, 'top', profile, 'bottom', 'N:1', FK)
connect(friends, 'top', user, 'bottom', 'N:1 sender', FK)
connect(message_t, 'top', user, 'bottom', 'N:1 sender/receiver', FK)
connect(api_keys, 'left', user, 'right', 'N:1', FK)
connect(feedback, 'left', user, 'right', 'N:1', FK)

# Title
ax.text(10, 0.5, 'ft_transcendence — Database Schema', ha='center', va='center',
        fontsize=16, fontweight='bold', color='#b388ff', family='monospace')

plt.tight_layout()
plt.savefig('db-schema.png', dpi=200, facecolor='#0e0e0e', bbox_inches='tight')
print("Saved db-schema.png")
