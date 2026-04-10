'use client';

import { Empty } from 'antd';

export default function CheckTab() {
  return (
    <div className="py-8">
      <Empty
        description="一致性检查功能开发中..."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    </div>
  );
}