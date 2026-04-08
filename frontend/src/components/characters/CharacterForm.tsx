'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Button,
  Space,
  Collapse,
  Tag,
  Divider,
} from 'antd';
import { PlusOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Character, PersonalityPalette, MotivationSystem, CharacterRelation } from '@/types';

const { TextArea } = Input;

interface CharacterFormProps {
  open: boolean;
  character: Character | null; // null for create, existing for edit
  allCharacters?: Character[]; // all characters in the project for relationship selection
  onClose: () => void;
  onSubmit: (values: Partial<Character>) => Promise<void>;
}

interface FormValues {
  name: string;
  aliases: string; // 逗号分隔的字符串，后端转为数组
  gender: string | null;
  age: number | null;
  arc_type: string | null;
  appearance: string;
  background: string;
  // 性格特质
  main_tone: string; // 核心性格标签，顿号分隔
  inner_logic: string; // 内逻辑/价值观
  catchphrases: string; // 习惯用语，逗号分隔
  gestures: string; // 典型小动作，逗号分隔
  // 动机系统
  goals: string; // 目标
  obsessions: string; // 执念
  fears: string; // 恐惧
  desires: string; // 渴望
  // 关系网络
  relationships: CharacterRelation[];
}

const genderOptions = [
  { value: '男', label: '男' },
  { value: '女', label: '女' },
  { value: '其他', label: '其他' },
];

const arcTypeOptions = [
  { value: '主角', label: '主角' },
  { value: '女主', label: '女主' },
  { value: '配角', label: '配角' },
  { value: '反派', label: '反派' },
  { value: '路人', label: '路人' },
];

const relationTypeOptions = [
  { value: '恋人', label: '恋人' },
  { value: '夫妻', label: '夫妻' },
  { value: '父母', label: '父母' },
  { value: '子女', label: '子女' },
  { value: '兄弟姐妹', label: '兄弟姐妹' },
  { value: '祖孙', label: '祖孙' },
  { value: '朋友', label: '朋友' },
  { value: '闺蜜', label: '闺蜜' },
  { value: '兄弟', label: '兄弟' },
  { value: '姐妹', label: '姐妹' },
  { value: '师徒', label: '师徒' },
  { value: '师生', label: '师生' },
  { value: '同学', label: '同学' },
  { value: '同事', label: '同事' },
  { value: '上下级', label: '上下级' },
  { value: '敌人', label: '敌人' },
  { value: '竞争对手', label: '竞争对手' },
  { value: '陌生人', label: '陌生人' },
  { value: '其他', label: '其他' },
];

const temperatureOptions = [
  { value: '热烈', label: '热烈' },
  { value: '温热', label: '温热' },
  { value: '温暖', label: '温暖' },
  { value: '温', label: '温' },
  { value: '中性', label: '中性' },
  { value: '冷淡', label: '冷淡' },
  { value: '冷', label: '冷' },
  { value: '寒冷', label: '寒冷' },
  { value: '敌对', label: '敌对' },
];

// 解析 personality_palette 数据到表单值
const parsePersonalityToForm = (palette: PersonalityPalette | undefined | null): Partial<FormValues> => {
  if (!palette) {
    return {
      main_tone: '',
      inner_logic: '',
      catchphrases: '',
      gestures: '',
    };
  }

  // 从 derivatives 中分离内逻辑和小动作
  const innerLogic = palette.derivatives
    ?.filter(d => !d.description.startsWith('小动作:'))
    .map(d => d.description)
    .join('\n') || '';

  const gestures = palette.derivatives
    ?.filter(d => d.description.startsWith('小动作:'))
    .map(d => d.description.replace('小动作:', '').trim())
    .join(', ') || '';

  return {
    main_tone: palette.main_tone || '',
    inner_logic: innerLogic,
    catchphrases: (palette.language_fingerprint || []).join(', '),
    gestures,
  };
};

// 将表单值转换为 personality_palette 格式
const formToPersonality = (values: FormValues): PersonalityPalette => {
  const catchphrases = values.catchphrases
    ? values.catchphrases.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : [];

  const gestures = values.gestures
    ? values.gestures.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : [];

  const innerLogicLines = values.inner_logic
    ? values.inner_logic.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  // 合并内逻辑和小动作到 derivatives
  const derivatives = [
    ...innerLogicLines.map(desc => ({ description: desc })),
    ...gestures.map(g => ({ description: `小动作:${g}` })),
  ];

  return {
    main_tone: values.main_tone?.trim() || '',
    base_color: '',
    accent: '',
    derivatives,
    language_fingerprint: catchphrases,
  };
};

// 解析 motivation 数据到表单值
const parseMotivationToForm = (motivation: MotivationSystem | undefined | null): Partial<FormValues> => {
  if (!motivation) {
    return {
      goals: '',
      obsessions: '',
      fears: '',
      desires: '',
    };
  }
  return {
    goals: (motivation.goals || []).join('\n'),
    obsessions: (motivation.obsessions || []).join('\n'),
    fears: (motivation.fears || []).join('\n'),
    desires: (motivation.desires || []).join('\n'),
  };
};

// 将表单值转换为 motivation 格式
const formToMotivation = (values: FormValues): MotivationSystem => {
  const goals = values.goals
    ? values.goals.split('\n').map(s => s.trim()).filter(Boolean)
    : [];
  const obsessions = values.obsessions
    ? values.obsessions.split('\n').map(s => s.trim()).filter(Boolean)
    : [];
  const fears = values.fears
    ? values.fears.split('\n').map(s => s.trim()).filter(Boolean)
    : [];
  const desires = values.desires
    ? values.desires.split('\n').map(s => s.trim()).filter(Boolean)
    : [];

  return { goals, obsessions, fears, desires };
};

export default function CharacterForm({
  open,
  character,
  allCharacters = [],
  onClose,
  onSubmit,
}: CharacterFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [traitInput, setTraitInput] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const isEditing = !!character;

  // Initialize form when modal opens or character changes
  useEffect(() => {
    if (open) {
      if (character) {
        const personalityValues = parsePersonalityToForm(character.personality_palette);
        const motivationValues = parseMotivationToForm(character.motivation);
        form.setFieldsValue({
          name: character.name,
          aliases: character.aliases?.join(', ') || '',
          gender: character.gender,
          age: character.age,
          arc_type: character.arc_type,
          appearance: character.appearance || '',
          background: character.background || '',
          ...personalityValues,
          ...motivationValues,
        });
        // 解析核心性格标签到 traits 数组
        const mainTone = character.personality_palette?.main_tone || '';
        setTraits(mainTone ? mainTone.split(/[、,，]/).map(s => s.trim()).filter(Boolean) : []);
      } else {
        form.resetFields();
        setTraits([]);
      }
      setTraitInput('');
    }
  }, [open, character, form]);

  // 添加性格标签
  const handleAddTrait = () => {
    const trimmed = traitInput.trim();
    if (trimmed && traits.length < 5 && !traits.includes(trimmed)) {
      const newTraits = [...traits, trimmed];
      setTraits(newTraits);
      form.setFieldValue('main_tone', newTraits.join('、'));
      setTraitInput('');
    }
  };

  // 删除性格标签
  const handleRemoveTrait = (trait: string) => {
    const newTraits = traits.filter(t => t !== trait);
    setTraits(newTraits);
    form.setFieldValue('main_tone', newTraits.join('、'));
  };

  // Trait input key press handler
  const handleTraitKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTrait();
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      // Convert aliases from comma-separated string to array
      // Handle both ASCII comma and Chinese comma, trim whitespace including Unicode spaces
      const aliases = values.aliases
        ? values.aliases.split(/[,，]/).map(s => s.trim().replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')).filter(Boolean)
        : [];

      const personality_palette = formToPersonality(values);
      const motivation = formToMotivation(values);

      const characterData: Partial<Character> = {
        name: values.name.trim(),
        aliases,
        gender: values.gender || null,
        age: values.age ? Number(values.age) : null,
        arc_type: values.arc_type || null,
        appearance: values.appearance?.trim() || '',
        background: values.background?.trim() || '',
        personality_palette,
        motivation,
        // Set defaults for new character
        ...(isEditing ? {
          // Preserve existing relationships when editing
        } : {
          status: '活跃',
          behavior_boundary: {
            forbidden_actions: [],
            exceptions: [],
            reason: '',
          },
          relationships: [],
        }),
      };

      // Include relationships if provided (editing case)
      if (values.relationships && values.relationships.length > 0) {
        characterData.relationships = values.relationships
          .filter(r => r.target_name && r.relation_type && r.temperature)
          .map(r => ({
            ...r,
            evolution: r.evolution || [],
          }));
      }

      await onSubmit(characterData);
      handleClose();
    } catch (error) {
      console.error('CharacterForm submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setTraits([]);
    setTraitInput('');
    onClose();
  };

  // Validate age as positive integer
  const validateAge = (_: unknown, value: string) => {
    if (!value) return Promise.resolve();
    // Reject decimals and non-numeric input
    if (!/^\d+$/.test(value)) {
      return Promise.reject(new Error('年龄必须为正整数'));
    }
    const num = parseInt(value, 10);
    if (num <= 0) {
      return Promise.reject(new Error('年龄必须为正整数'));
    }
    if (num > 200) {
      return Promise.reject(new Error('年龄不能超过200'));
    }
    return Promise.resolve();
  };

  const collapseItems = [
    {
      key: 'personality',
      label: '性格特质（可选）',
      children: (
        <div className="space-y-4">
          {/* 核心性格标签 */}
          <div>
            <label className="block text-sm mb-1">核心性格标签</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {traits.map(trait => (
                <Tag
                  key={trait}
                  closable
                  onClose={() => handleRemoveTrait(trait)}
                  closeIcon={<CloseOutlined className="text-xs" />}
                  color="blue"
                >
                  {trait}
                </Tag>
              ))}
            </div>
            <Space.Compact className="w-full">
              <Input
                placeholder="输入性格标签（如：沉稳、隐忍）"
                value={traitInput}
                onChange={(e) => setTraitInput(e.target.value)}
                onKeyPress={handleTraitKeyPress}
                maxLength={20}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTrait}
                disabled={traits.length >= 5 || !traitInput.trim()}
              >
                添加
              </Button>
            </Space.Compact>
            <p className="text-xs text-on-surface-variant mt-1">
              最多 5 个标签，按回车或点击添加
            </p>
          </div>

          {/* 内逻辑/价值观 */}
          <Form.Item name="inner_logic" label="内逻辑/价值观">
            <TextArea
              rows={2}
              placeholder="角色的价值观和行为准则（如：守护他人 > 个人得失）&#10;每行一条，用于行为推演"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 习惯用语 */}
          <Form.Item
            name="catchphrases"
            label="习惯用语/口头禅"
            extra="多个用逗号分隔，用于语言风格一致性检查"
          >
            <Input placeholder='"罢了", "且慢", "有意思"' maxLength={200} />
          </Form.Item>

          {/* 典型小动作 */}
          <Form.Item
            name="gestures"
            label="典型小动作"
            extra="多个用逗号分隔，用于行为描写一致性"
          >
            <Input placeholder="习惯性摩挲手指, 思考时皱眉" maxLength={200} />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'motivation',
      label: '动机系统（可选）',
      children: (
        <div className="space-y-4">
          {/* 目标 */}
          <Form.Item
            name="goals"
            label="目标"
            extra="角色想要达成的目标，每行一条，用于行为推演（权重25%）"
          >
            <TextArea
              rows={2}
              placeholder="例如：复仇&#10;守护家人&#10;成为强者"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 执念 */}
          <Form.Item
            name="obsessions"
            label="执念"
            extra="角色无法放下的执念，每行一条"
          >
            <TextArea
              rows={2}
              placeholder="例如：对权力的渴望&#10;对初恋的执念"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 恐惧 */}
          <Form.Item
            name="fears"
            label="恐惧"
            extra="角色最害怕的事情，每行一条"
          >
            <TextArea
              rows={2}
              placeholder="例如：失去亲人&#10;被背叛&#10;孤独终老"
              maxLength={500}
              showCount
            />
          </Form.Item>

          {/* 渴望 */}
          <Form.Item
            name="desires"
            label="渴望"
            extra="角色内心真正需要的，每行一条"
          >
            <TextArea
              rows={2}
              placeholder="例如：被理解&#10;被接纳&#10;找到真相"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </div>
      ),
    },
    {
      key: 'relationships',
      label: '关系网络（可选）',
      children: (
        <Form.List name="relationships">
          {(fields, { add, remove }) => (
            <div className="space-y-4">
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <Row gutter={16}>
                    <Col span={10}>
                      <Form.Item
                        {...restField}
                        name={[name, 'target_name']}
                        label="目标角色"
                        rules={[{ required: true, message: '请选择目标角色' }]}
                      >
                        <Select
                          placeholder="选择角色"
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          options={allCharacters
                            .filter(c => c.name !== character?.name)
                            .map(c => ({ value: c.name, label: c.name }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        {...restField}
                        name={[name, 'relation_type']}
                        label="关系类型"
                        rules={[{ required: true, message: '请选择关系类型' }]}
                      >
                        <Select placeholder="选择关系" options={relationTypeOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        {...restField}
                        name={[name, 'temperature']}
                        label="关系温度"
                        rules={[{ required: true, message: '请选择关系温度' }]}
                      >
                        <Select placeholder="选择温度" options={temperatureOptions} />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* 演变历史 */}
                  <div className="mt-2">
                    <label className="text-sm text-on-surface-variant mb-1 block">演变历史</label>
                    <Form.List name={[name, 'evolution']}>
                      {(evoFields, { add: addEvo, remove: removeEvo }) => (
                        <>
                          {evoFields.map((evoField) => (
                            <Space key={evoField.key} className="mb-2 w-full">
                              <Form.Item
                                {...evoField}
                                name={evoField.name}
                                rules={[{ required: false }]}
                                style={{ marginBottom: 0 }}
                              >
                                <Input
                                  placeholder="例如：第1章从敌人变为朋友"
                                  style={{ width: 300 }}
                                />
                              </Form.Item>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeEvo(evoField.name)}
                              />
                            </Space>
                          ))}
                          <Button
                            type="dashed"
                            onClick={() => addEvo('')}
                            icon={<PlusOutlined />}
                            className="w-full"
                          >
                            添加演变记录
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                    className="mt-2"
                  >
                    删除此关系
                  </Button>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => add({ target_name: '', relation_type: '', temperature: '', evolution: [] })}
                icon={<PlusOutlined />}
                className="w-full"
              >
                添加关系
              </Button>
            </div>
          )}
        </Form.List>
      ),
    },
  ];

  return (
    <Modal
      title={isEditing ? '编辑角色' : '创建角色'}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          gender: null,
          arc_type: null,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="角色名称"
              rules={[
                { required: true, message: '请输入角色名称' },
                { max: 50, message: '名称不能超过50个字符' },
              ]}
            >
              <Input
                placeholder="输入角色名称"
                disabled={isEditing}
                maxLength={50}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="aliases"
              label="别名"
              extra="多个别名用逗号分隔"
            >
              <Input placeholder="别名1, 别名2, ..." maxLength={200} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="gender" label="性别">
              <Select placeholder="选择性别" allowClear options={genderOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="age"
              label="年龄"
              rules={[{ validator: validateAge }]}
            >
              <Input type="number" placeholder="年龄" min={1} max={200} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="arc_type" label="角色类型">
          <Select placeholder="选择角色类型" allowClear options={arcTypeOptions} />
        </Form.Item>

        <Form.Item name="appearance" label="外貌描写">
          <TextArea
            rows={2}
            placeholder="描述角色的外貌特征（如：身高、体型、发色、衣着风格等）"
            maxLength={1000}
            showCount
          />
        </Form.Item>

        <Form.Item name="background" label="背景故事">
          <TextArea
            rows={4}
            placeholder="角色的背景故事、经历、出身等"
            maxLength={5000}
            showCount
          />
        </Form.Item>

        {/* 性格特质折叠面板 */}
        <Collapse
          items={collapseItems}
          bordered={false}
          className="bg-surface-container mb-4"
        />

        <Form.Item className="mb-0 text-right">
          <Space>
            <Button onClick={handleClose}>取消</Button>
            <Button type="primary" htmlType="submit" loading={loading} disabled={loading}>
              {isEditing ? '保存' : '创建'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
