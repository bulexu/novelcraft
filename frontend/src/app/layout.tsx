import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NovelCraft - AI小说创作助手",
  description: "Vibe Writing - 用自然语言创作你的小说",
};

// Zen Editorial Design System Theme for Ant Design
const zenEditorialTheme = {
  token: {
    // Typography
    fontFamily: 'var(--font-body), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,

    // Colors - Primary (Indigo)
    colorPrimary: '#4648d4',
    colorPrimaryHover: '#6063ee',
    colorPrimaryActive: '#2f2ebe',
    colorPrimaryBg: '#e1e0ff',
    colorPrimaryBgHover: '#f5f2fe',

    // Colors - Surfaces
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#fcf8ff',
    colorBgSubtle: '#f5f2fe',

    // Colors - Text
    colorText: '#1b1b23',
    colorTextSecondary: '#464554',
    colorTextTertiary: '#767586',
    colorTextQuaternary: '#c7c4d7',

    // Colors - Border (minimal use per Zen Editorial)
    colorBorder: '#c7c4d7',
    colorBorderSecondary: '#e4e1ed',

    // Colors - Error
    colorError: '#ba1a1a',
    colorErrorHover: '#d32f2f',
    colorErrorBg: '#ffdad6',

    // Colors - Warning (Tertiary)
    colorWarning: '#904900',
    colorWarningHover: '#b55d00',
    colorWarningBg: '#ffdcc5',

    // Colors - Success
    colorSuccess: '#4caf50',
    colorSuccessBg: '#e8f5e9',

    // Border Radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // Shadows - Ambient only (Zen Editorial style)
    boxShadow: '0 12px 40px rgba(27, 27, 35, 0.06)',
    boxShadowSecondary: '0 6px 20px rgba(27, 27, 35, 0.04)',

    // Control Heights
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Animation
    motionDurationFast: '150ms',
    motionDurationMid: '200ms',
    motionDurationSlow: '300ms',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  components: {
    Button: {
      controlHeight: 36,
      fontWeight: 500,
      defaultBorderColor: 'transparent',
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow: 'none',
    },
    Input: {
      controlHeight: 36,
      paddingInline: 12,
      borderColor: 'transparent',
      hoverBorderColor: '#c7c4d7',
      activeBorderColor: '#4648d4',
      colorBgContainer: '#f5f2fe',
    },
    InputNumber: {
      controlHeight: 36,
    },
    Select: {
      controlHeight: 36,
      optionSelectedBg: '#e1e0ff',
      selectorBg: '#f5f2fe',
    },
    Card: {
      colorBgContainer: '#ffffff',
      boxShadow: '0 12px 40px rgba(27, 27, 35, 0.06)',
      borderColor: 'transparent',
    },
    Modal: {
      contentBg: '#ffffff',
      headerBg: '#ffffff',
      footerBg: '#f5f2fe',
      titleFontSize: 18,
      boxShadow: '0 12px 40px rgba(27, 27, 35, 0.06)',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#e1e0ff',
      itemSelectedColor: '#4648d4',
      subMenuItemBg: '#f5f2fe',
    },
    Tabs: {
      cardBg: '#f5f2fe',
      itemSelectedColor: '#4648d4',
      inkBarColor: '#4648d4',
    },
    Tag: {
      defaultBg: '#f5f2fe',
      defaultColor: '#464554',
    },
    Table: {
      headerBg: '#f5f2fe',
      rowHoverBg: '#f5f2fe',
      borderColor: '#e4e1ed',
    },
    Tooltip: {
      colorBgSpotlight: '#303038',
      colorTextLightSolid: '#f2effb',
    },
    Popover: {
      colorBgElevated: '#ffffff',
    },
    Dropdown: {
      colorBgElevated: '#ffffff',
      controlItemBgHover: '#f5f2fe',
      controlItemBgActive: '#e1e0ff',
    },
    Drawer: {
      colorBgElevated: '#ffffff',
    },
    Message: {
      contentBg: '#ffffff',
    },
    Notification: {
      colorBgElevated: '#ffffff',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
        <AntdRegistry>
          <ConfigProvider locale={zhCN} theme={zenEditorialTheme}>
            <AntApp>
              {children}
            </AntApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}