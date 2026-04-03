'use client';

import { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  message,
  Spin,
  Tag,
  Space,
  Alert,
  Descriptions,
  List,
  Avatar,
  Empty,
  Divider,
} from 'antd';
import {
  PlayCircleOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { simulationApi } from '@/lib/api';
import type { SimulationResult, StoryPrediction } from '@/types';

const { TextArea } = Input;

interface SimulationPanelProps {
  projectId: string;
  characters: { name: string; role: string; description: string }[];
  currentChapter?: number;
}

export default function SimulationPanel({ projectId, characters, currentChapter = 1 }: SimulationPanelProps) {
  const [scenario, setScenario] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [platform, setPlatform] = useState<'twitter' | 'reddit' | 'narrative'>('narrative');
  const [numRounds, setNumRounds] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [prediction, setPrediction] = useState<StoryPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    if (!scenario.trim()) {
      message.warning('请输入场景描述');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const res = await simulationApi.createAndRun(projectId, {
        scenario: scenario.trim(),
        character_names: selectedCharacters.length > 0 ? selectedCharacters : undefined,
        num_rounds: numRounds,
        platform,
      });
      setResult(res);
      message.success('模拟完成');
    } catch (err) {
      setError(err instanceof Error ? err.message : '模拟运行失败');
      message.error('模拟失败');
    } finally {
      setIsRunning(false);
    }
  };

  const handlePredictStory = async () => {
    setIsRunning(true);
    setError(null);
    setPrediction(null);

    try {
      const res = await simulationApi.predict(projectId, {
        chapter: currentChapter,
        prediction_type: 'character_interactions',
      });
      setPrediction(res);
      message.success('预测完成');
    } catch (err) {
      setError(err instanceof Error ? err.message : '预测失败');
      message.error('预测失败');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Scenario Input */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined className="text-primary" />
            <span>角色社交模拟</span>
          </Space>
        }
      >
        <div className="space-y-4">
          {/* Scenario */}
          <div>
            <label className="block text-sm text-on-surface-variant mb-2">场景描述</label>
            <TextArea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="描述一个场景，角色们将在其中进行社交互动..."
              rows={4}
            />
          </div>

          {/* Character Selection */}
          <div>
            <label className="block text-sm text-on-surface-variant mb-2">参与角色</label>
            <Select
              mode="multiple"
              value={selectedCharacters}
              onChange={setSelectedCharacters}
              placeholder="选择参与的角色（不选则使用全部）"
              className="w-full"
              options={characters.map(c => ({ label: c.name, value: c.name }))}
            />
            <p className="text-xs text-on-surface-variant mt-2">
              {selectedCharacters.length > 0
                ? `已选择 ${selectedCharacters.length} 个角色`
                : '未选择时将使用所有角色'}
            </p>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-on-surface-variant mb-2">模拟平台</label>
              <Select
                value={platform}
                onChange={(v) => setPlatform(v)}
                className="w-full"
                options={[
                  { value: 'narrative', label: '叙事平台 (小说专用)' },
                  { value: 'reddit', label: 'Reddit 风格' },
                  { value: 'twitter', label: 'Twitter 风格' },
                ]}
              />
            </div>
            <div>
              <label className="block text-sm text-on-surface-variant mb-2">模拟轮次</label>
              <Input
                type="number"
                value={numRounds}
                onChange={(e) => setNumRounds(Math.max(1, Math.min(50, parseInt(e.target.value) || 10)))}
                min={1}
                max={50}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleRunSimulation}
              loading={isRunning}
            >
              开始模拟
            </Button>
            <Button
              icon={<BulbOutlined />}
              onClick={handlePredictStory}
              loading={isRunning}
            >
              预测发展
            </Button>
          </Space>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Simulation Result */}
      {result && (
        <Card
          title={
            <Space>
              <CheckCircleOutlined className="text-primary" />
              <span>模拟结果</span>
            </Space>
          }
        >
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2 mb-4">
              <Tag color={result.status === 'completed' ? 'success' : result.status === 'failed' ? 'error' : 'processing'}>
                {result.status === 'completed' ? '已完成' :
                 result.status === 'failed' ? '失败' :
                 result.status === 'running' ? '进行中' : result.status}
              </Tag>
              <span className="text-sm text-on-surface-variant">
                完成轮次: {result.rounds_completed}
              </span>
            </div>

            {/* Predictions */}
            {result.story_predictions.length > 0 && (
              <div>
                <h4 className="font-bold text-on-surface mb-2">故事预测</h4>
                <List
                  dataSource={result.story_predictions}
                  renderItem={(pred) => (
                    <List.Item>
                      <div className="flex items-start gap-2">
                        <BulbOutlined className="text-primary mt-1" />
                        <span>{pred}</span>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            )}

            {/* Interactions */}
            {result.interactions.length > 0 && (
              <div>
                <Divider />
                <h4 className="font-bold text-on-surface mb-2">互动记录 ({result.interactions.length})</h4>
                <div className="max-h-[200px] overflow-y-auto">
                  <List
                    size="small"
                    dataSource={result.interactions.slice(0, 10)}
                    renderItem={(interaction) => (
                      <List.Item>
                        <Tag>{interaction.type}</Tag>
                        {interaction.content && (
                          <span className="text-xs text-on-surface-variant truncate max-w-[300px]">
                            {interaction.content.slice(0, 50)}...
                          </span>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Story Prediction Result */}
      {prediction && (
        <Card
          title={
            <Space>
              <BulbOutlined className="text-primary" />
              <span>第 {prediction.chapter} 章发展预测</span>
            </Space>
          }
        >
          {/* Characters Involved */}
          <div className="mb-4">
            <h4 className="font-bold text-on-surface mb-2">涉及角色</h4>
            <Space wrap>
              {prediction.characters_involved.map((name) => (
                <Tag key={name} color="blue">{name}</Tag>
              ))}
            </Space>
          </div>

          {/* Predictions */}
          <div className="space-y-3">
            {prediction.predictions.map((pred, i) => (
              <Card key={i} className="bg-surface-container-low" styles={{ body: { padding: '12px 16px' } }}>
                <div className="flex items-start gap-2">
                  <Avatar size="small" className="bg-primary/20 text-primary">{i + 1}</Avatar>
                  <span>{pred}</span>
                </div>
              </Card>
            ))}
          </div>

          <p className="text-xs text-on-surface-variant mt-4">
            基于 {prediction.interactions_count} 次模拟互动
          </p>
        </Card>
      )}

      {/* Info Card */}
      <Alert
        message="关于 Oasis 社交模拟"
        description="Oasis 是一个基于 CAMEL-AI 的社交模拟框架，可以让小说角色在虚拟社交平台上互动，预测故事发展和角色关系变化。模拟结果可以帮助作家更好地理解角色的行为模式和潜在的故事走向。"
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
      />
    </div>
  );
}