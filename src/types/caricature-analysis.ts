// 简笔画/讽刺画分析结果类型
export interface CaricatureAnalysis {
  // 最突出的特征（用于夸张表现）
  dominant_features: {
    primary: string; // 最主要特征
    secondary: string[]; // 次要特征
    unique_traits: string[]; // 独特特征
  };

  // 几何形状简化
  geometric_shapes: {
    face_shape: {
      base_shape:
        | "circle"
        | "oval"
        | "square"
        | "triangle"
        | "diamond"
        | "rectangle";
      proportions: "wide" | "narrow" | "standard";
      jawline: "sharp" | "soft" | "strong" | "delicate";
    };
    eyes: {
      shape: "round" | "almond" | "narrow" | "wide" | "droopy" | "upturned";
      size: "large" | "medium" | "small";
      spacing: "close" | "normal" | "wide";
      expression: string;
    };
    nose: {
      shape: "straight" | "curved" | "button" | "hooked" | "wide" | "narrow";
      size: "prominent" | "medium" | "small";
      bridge: "high" | "low" | "straight";
    };
    mouth: {
      shape: "full" | "thin" | "wide" | "small" | "curved";
      expression: "neutral" | "smiling" | "serious" | "pouty";
    };
    eyebrows: {
      shape: "straight" | "arched" | "thick" | "thin" | "angled";
      position: "high" | "normal" | "low";
    };
  };

  // 关键比例（用于准确绘制）
  proportions: {
    face_length_to_width: number; // 面长宽比
    eye_position: number; // 眼部位置比例
    nose_length: number; // 鼻长比例
    mouth_position: number; // 嘴部位置比例
  };

  // 简笔画绘制指导
  sketch_guidance: {
    drawing_order: string[]; // 绘制顺序
    key_lines: string[]; // 关键线条描述
    emphasis_points: string[]; // 需要强调的点
    simplification_tips: string[]; // 简化技巧
  };

  // 风格建议
  style_recommendations: {
    cartoon_style: "realistic" | "cute" | "exaggerated" | "minimalist";
    line_weight: "thin" | "medium" | "thick" | "varied";
    detail_level: "minimal" | "moderate" | "detailed";
  };

  // 特征重要性排序
  feature_priority: {
    most_important: string;
    secondary_features: string[];
    optional_features: string[];
  };
}
