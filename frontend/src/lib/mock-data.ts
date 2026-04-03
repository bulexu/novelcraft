/**
 * Mock Data for Development
 *
 * Used when backend API is not available.
 * Controlled by NEXT_PUBLIC_ENABLE_MOCKS environment variable.
 */

import type {
  Project,
  Character,
  Chapter,
  ProjectStats,
  Simulation,
  StyleFingerprintResponse,
} from '@/types';

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: '红楼梦同人：黛玉重生',
    description: '林黛玉重生回到进贾府的第一天，她决定改变自己的命运...',
    genre: '古代言情',
    target_style: '古典雅致',
    target_words: 500000,
    status: 'ongoing',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z',
  },
  {
    id: 'proj-2',
    name: '赛博朋克：霓虹都市',
    description: '2077年的东京，一个黑客在虚拟与现实的边界挣扎...',
    genre: '科幻',
    target_style: '赛博朋克',
    target_words: 300000,
    status: 'draft',
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-15T12:00:00Z',
  },
  {
    id: 'proj-3',
    name: '仙路争锋',
    description: '一个普通少年踏上修仙之路，在正邪之间寻找自己的道...',
    genre: '仙侠',
    target_style: '古典仙侠',
    target_words: 800000,
    status: 'ongoing',
    created_at: '2023-11-20T14:00:00Z',
    updated_at: '2024-03-18T09:00:00Z',
  },
];

// Mock Project Stats
export const mockProjectStats: Record<string, ProjectStats> = {
  'proj-1': {
    project_id: 'proj-1',
    project_name: '红楼梦同人：黛玉重生',
    total_chapters: 42,
    total_words: 125680,
    total_characters: 15,
    status: 'ongoing',
    genre: '古代言情',
  },
  'proj-2': {
    project_id: 'proj-2',
    project_name: '赛博朋克：霓虹都市',
    total_chapters: 8,
    total_words: 24500,
    total_characters: 6,
    status: 'draft',
    genre: '科幻',
  },
  'proj-3': {
    project_id: 'proj-3',
    project_name: '仙路争锋',
    total_chapters: 120,
    total_words: 456000,
    total_characters: 28,
    status: 'ongoing',
    genre: '仙侠',
  },
};

// Mock Characters
export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: '林黛玉',
    aliases: ['颦儿', '潇湘妃子'],
    gender: '女',
    age: 16,
    status: 'active',
    arc_type: '成长型',
    appearance: '两弯似蹙非蹙罥烟眉，一双似喜非喜含情目。态生两靥之愁，娇袭一身之病。',
    background: '林如海之女，贾母的外孙女，自幼体弱多病，性格敏感多思。',
    personality_palette: {
      main_tone: '敏感多思',
      base_color: '忧郁清冷',
      accent: '聪慧机敏',
      derivatives: [
        { description: '对诗词有极高天赋' },
        { description: '容易触景生情' },
      ],
      language_fingerprint: ['诗词引用', '含蓄表达', '反问句多'],
    },
    behavior_boundary: {
      forbidden_actions: ['不会主动迎合他人', '不会违背自己的心意'],
      exceptions: [{ condition: '对贾宝玉', action: '会展现真实的自己' }],
      reason: '性格孤高，不愿随波逐流',
    },
    relationships: [
      { target_name: '贾宝玉', relation_type: '恋人', temperature: '温热', evolution: ['初见倾心', '心意相通'] },
      { target_name: '薛宝钗', relation_type: '情敌', temperature: '冷', evolution: ['表面和平', '暗中较劲'] },
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z',
  },
  {
    id: 'char-2',
    name: '贾宝玉',
    aliases: ['宝二爷', '怡红公子'],
    gender: '男',
    age: 17,
    status: 'active',
    arc_type: '探索型',
    appearance: '面如中秋之月，色如春晓之花，鬓若刀裁，眉如墨画。',
    background: '贾政与王夫人之子，衔玉而生，厌恶功名，偏爱女儿清净。',
    personality_palette: {
      main_tone: '叛逆多情',
      base_color: '温柔体贴',
      accent: '率真天真',
      derivatives: [
        { description: '对女儿有特殊的怜惜之情' },
        { description: '厌恶八股科举' },
      ],
      language_fingerprint: ['口语化', '直接表达', '偶有诗词'],
    },
    behavior_boundary: {
      forbidden_actions: ['不会强迫他人', '不会追求功名'],
      exceptions: [{ condition: '被贾政责打', action: '会暂时收敛' }],
      reason: '天生叛逆，不愿受世俗约束',
    },
    relationships: [
      { target_name: '林黛玉', relation_type: '恋人', temperature: '热烈', evolution: ['青梅竹马', '心意相通'] },
      { target_name: '薛宝钗', relation_type: '表姐', temperature: '温', evolution: ['礼貌相处', '被动接受'] },
    ],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z',
  },
];

// Mock Chapters
export const mockChapters: Chapter[] = [
  {
    chapter: 1,
    title: '初入荣国府',
    word_count: 3500,
    characters: ['林黛玉', '贾母', '王熙凤'],
    location: '荣国府',
    foreshadowing: [],
    content: `黛玉自那日弃舟登岸，便有荣国府打发了轿子并拉行李的车辆久候了。自上了轿，进入城中，从纱窗向外瞧了一瞧，其街市之繁华，人烟之阜盛，自与别处不同。

又行了半日，忽见街北蹲着两个大石狮子，三间兽头大门，门前列坐着十来个华冠丽服之人。正门却不开，只有东西两角门有人出入。正门之上有一匾，匾上大书"敕造宁国府"五个大字。

黛玉想道："这是外祖母之长房。"又往西行不多远，照样也是三间大门，方是荣国府了。却不进正门，只进了西边角门。`,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
  {
    chapter: 2,
    title: '宝黛初会',
    word_count: 4200,
    characters: ['林黛玉', '贾宝玉', '贾母'],
    location: '荣国府',
    foreshadowing: [],
    content: `一语未了，只听后院中有人笑声，说："我来迟了，不曾迎接远客！"黛玉纳罕道："这些人个个皆敛声屏气，恭肃严整如此，这来者系谁，这样放诞无礼？"

心下想时，只见一群媳妇丫鬟围拥着一个人从后房门进来。这个人打扮与众姑娘不同，彩绣辉煌，恍若神妃仙子...

黛玉心中正疑惑着："这个宝玉，不知是怎生个惫懒人物，懵懂顽童？"倒不见那蠢物也罢了。心中想着，忽见丫鬟话未报完，已进来了一位年轻的公子...`,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
  },
  {
    chapter: 3,
    title: '暗流涌动',
    word_count: 3800,
    characters: ['林黛玉', '贾宝玉', '王熙凤'],
    location: '荣国府',
    foreshadowing: [],
    content: `雨丝细密地斜织在窗棂上，发出若有若无的沙沙声。在这个静谧得近乎压抑的午后，黛玉独自坐在潇湘馆中，手中的狼毫笔尖悬在宣纸上方，迟迟没有落下。

浓稠的墨汁在笔尖汇聚，如同一颗黑色的泪珠，映照着阁楼内昏黄的灯火...`,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z',
  },
];

// Mock Simulations
export const mockSimulations: Simulation[] = [
  {
    simulation_id: 'sim-1',
    status: 'completed',
    project_id: 'proj-1',
    platform: 'twitter',
    num_rounds: 10,
    agent_count: 5,
    seed_scenario: '林黛玉在虚拟社交平台上分享了自己的诗作',
    created_at: '2024-03-15T10:00:00Z',
  },
];

// Mock Style Fingerprint
export const mockStyleFingerprint: StyleFingerprintResponse = {
  project_id: 'proj-1',
  analyzed_at: '2024-03-20T10:00:00Z',
  confidence: 0.92,
  sentence_patterns: {
    average_length: 25,
    short_ratio: 0.3,
    long_ratio: 0.2,
    punctuation: { '，': 0.5, '。': 0.3, '；': 0.1, '：': 0.1 },
  },
  vocabulary_profile: {
    frequent_words: ['只见', '原来', '正是', '不曾', '只是'],
    avoided_words: ['但是', '然后', '所以'],
    colloquial_level: 0.2,
    dialect_words: ['罢', '罢了', '才刚'],
  },
  description_style: {
    scene_density: 0.7,
    psychology_method: 'implicit',
    dialogue_style: 'classical',
  },
  narrative_rhythm: {
    chapter_average_length: 3500,
    pacing_speed: 'moderate',
    climax_cycle: 5,
  },
};

// Check if mocks are enabled
export function isMockEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true';
}

// Mock API responses
export const mockApi = {
  projects: {
    list: () => Promise.resolve({ items: mockProjects, total: mockProjects.length }),
    get: (id: string) => {
      const project = mockProjects.find(p => p.id === id);
      return project ? Promise.resolve(project) : Promise.reject(new Error('Not found'));
    },
    stats: (id: string) => {
      const stats = mockProjectStats[id];
      return stats ? Promise.resolve(stats) : Promise.reject(new Error('Not found'));
    },
    create: (data: Partial<Project>) => {
      const project: Project = {
        id: `proj-${Date.now()}`,
        name: data.name || '新项目',
        description: data.description || '',
        genre: data.genre || '其他',
        target_style: '',
        target_words: data.target_words || 100000,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProjects.push(project);
      return Promise.resolve(project);
    },
  },
  characters: {
    list: () => Promise.resolve({ items: mockCharacters, total: mockCharacters.length }),
    get: (name: string) => {
      const char = mockCharacters.find(c => c.name === name);
      return char ? Promise.resolve(char) : Promise.reject(new Error('Not found'));
    },
  },
  chapters: {
    list: () => Promise.resolve({ items: mockChapters, total: mockChapters.length, total_words: mockChapters.reduce((sum, c) => sum + c.word_count, 0) }),
    get: (num: number) => {
      const chapter = mockChapters.find(c => c.chapter === num);
      return chapter ? Promise.resolve(chapter) : Promise.reject(new Error('Not found'));
    },
    create: (data: Partial<Chapter>) => {
      const chapter: Chapter = {
        chapter: data.chapter || mockChapters.length + 1,
        title: data.title || `第${data.chapter}章`,
        word_count: 0,
        characters: [],
        location: null,
        foreshadowing: [],
        content: data.content || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockChapters.push(chapter);
      return Promise.resolve(chapter);
    },
    update: (num: number, data: Partial<Chapter>) => {
      const idx = mockChapters.findIndex(c => c.chapter === num);
      if (idx >= 0) {
        mockChapters[idx] = { ...mockChapters[idx], ...data };
        return Promise.resolve(mockChapters[idx]);
      }
      return Promise.reject(new Error('Not found'));
    },
  },
  inference: {
    characterBehavior: (characterName: string, scenario: string) => {
      return Promise.resolve({
        character_name: characterName,
        scenario,
        inference_result: `${characterName}在当前场景下可能会表现出敏感多思的特征，对周围环境保持高度警觉，同时内心活动丰富。根据其性格特征，预计会有含蓄的情感表达方式。`,
        factors_used: {
          personality_weight: 0.4,
          state_weight: 0.25,
          motivation_weight: 0.2,
          pressure_weight: 0.15,
        },
        timestamp: new Date().toISOString(),
      });
    },
  },
  style: {
    continue: (context: string) => {
      return Promise.resolve({
        continued_content: `\n\n续写内容示例：春风拂过庭院，花瓣纷纷扬扬地落在青石板上。黛玉轻叹一声，将手中的诗稿折起，目光透过窗棂望向远方。她知道，有些事情终究要面对...`,
        target_length: 500,
        style_matched: true,
        timestamp: new Date().toISOString(),
      });
    },
  },
  consistency: {
    check: (content: string) => {
      return Promise.resolve({
        content_checked: content,
        check_type: 'all',
        result: `一致性检查通过。\n\n1. 角色一致性：当前场景中出现的角色行为符合其设定。\n2. 世界设定一致性：环境描写与之前章节保持一致。\n3. 情节连贯性：时间线无冲突，情节发展合理。`,
        timestamp: new Date().toISOString(),
      });
    },
  },
  chat: {
    send: (message: string) => {
      return Promise.resolve({
        response: `收到您的问题："${message}"。作为您的写作助手，我建议可以从以下几个方面考虑：\n\n1. 角色动机：思考角色在此场景下的真实需求\n2. 情节发展：确保行为推动故事向前\n3. 情感层次：增加细腻的心理描写`,
        session_id: `session-${Date.now()}`,
        context_used: {
          project_id: 'proj-1',
          focus: null,
        },
        timestamp: new Date().toISOString(),
      });
    },
  },
};