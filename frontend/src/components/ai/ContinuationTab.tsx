'use client';

import { Empty } from 'antd';

export default function ContinuationTab() {
  return (
    <div className="py-8">
      <Empty
        description="续写功能开发中..."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
}