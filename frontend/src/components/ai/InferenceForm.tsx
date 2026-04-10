'use client';

import { useState } from 'react';
import { Form, Select, Input, Button, message } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import type { Character } from '@/types';
import { inferenceApi } from '@/lib/api';

interface InferenceFormProps {
  projectId: string;
  characters: Character[];
}

interface InferenceFormData {
  characterName: string;
  sceneDescription: string;
  currentState?: string;
  externalPressure?: string;
}

export default function InferenceForm({ projectId, characters }: InferenceFormProps) {
  const [form] = Form.useForm<InferenceFormData>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: InferenceFormData) => {
    setLoading(true);
    try {
      // 调用多因素加权推演 API
      const result = await inferenceApi.inferBehavior(projectId, {
        character_name: values.characterName,
        scenario: values.sceneDescription,
        current_state: values.currentState,
        external_pressure: values.externalPressure,
      });

      message.success('推演完成');
      console.log('Inference result:', result);

      // Story 3.4 将实现结果展示
    } catch (error) {
      console.error('Inference failed:', error);
      message.error('推演请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const characterOptions = characters.map(c => ({
    value: c.name,
    label: c.name,
  }));

  return (
    <div className="p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="characterName"
          label="选择角色"
          rules={[{ required: true, message: '请选择要推演的角色' }]}
        >
          <Select
            placeholder="选择角色"
            options={characterOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          name="sceneDescription"
          label="场景描述"
          rules={[
            { required: true, message: '请输入场景描述' },
            { max: 500, message: '场景描述不能超过 500 字' },
          ]}
        >
          <Input.TextArea
            placeholder="描述角色所处的场景和情境..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="currentState"
          label="当前状态（可选）"
        >
          <Input
            placeholder="如：情绪平静，身体状况良好"
          />
        </Form.Item>

        <Form.Item
          name="externalPressure"
          label="外部压力（可选）"
        >
          <Input
            placeholder="如：30分钟内必须离开"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<ThunderboltOutlined />}
            block
          >
            开始推演
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}