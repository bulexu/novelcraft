'use client';

import { Empty } from 'antd';

export default function AnalysisTab() {
  return (
    <div className="py-8">
      <Empty
        description="分析功能开发中..."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
}