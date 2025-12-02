import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';

interface PatternOverlayProps {
  opacity?: number;
  patternType?: 'grid' | 'dots' | 'graph';
}

export default function PatternOverlay({ 
  opacity = 0.3, 
  patternType = 'graph' 
}: PatternOverlayProps) {
  const { width, height } = Dimensions.get('window');
  const gridSize = 50;
  const dotSpacing = 40;
  const dotRadius = 2;
  const strokeColor = `rgba(184, 158, 246, ${opacity})`;
  const dotColor = `rgba(184, 158, 246, ${Math.min(opacity * 1.8, 0.6)})`;

  const patternElements = useMemo(() => {
    const elements: React.ReactElement[] = [];
    
    switch (patternType) {
      case 'grid':
        // Render grid lines - limit to visible area
        const maxX = Math.ceil(width / gridSize) * gridSize;
        const maxY = Math.ceil(height / gridSize) * gridSize;
        
        for (let x = 0; x <= maxX; x += gridSize) {
          elements.push(
            <Line
              key={`v-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke={strokeColor}
              strokeWidth="1"
            />
          );
        }
        for (let y = 0; y <= maxY; y += gridSize) {
          elements.push(
            <Line
              key={`h-${y}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={strokeColor}
              strokeWidth="1"
            />
          );
        }
        break;
      
      case 'dots':
        // Render dots - limit to visible area
        for (let x = dotSpacing; x < width; x += dotSpacing) {
          for (let y = dotSpacing; y < height; y += dotSpacing) {
            elements.push(
              <Circle
                key={`dot-${x}-${y}`}
                cx={x}
                cy={y}
                r={dotRadius}
                fill={dotColor}
              />
            );
          }
        }
        break;
      
      case 'graph':
      default:
        // Graph pattern with grid lines and connection dots
        const graphMaxX = Math.ceil(width / gridSize) * gridSize;
        const graphMaxY = Math.ceil(height / gridSize) * gridSize;
        
        // Vertical grid lines
        for (let x = 0; x <= graphMaxX; x += gridSize) {
          elements.push(
            <Line
              key={`v-${x}`}
              x1={x}
              y1={0}
              x2={x}
              y2={height}
              stroke={strokeColor}
              strokeWidth="1"
            />
          );
        }
        
        // Horizontal grid lines
        for (let y = 0; y <= graphMaxY; y += gridSize) {
          elements.push(
            <Line
              key={`h-${y}`}
              x1={0}
              y1={y}
              x2={width}
              y2={y}
              stroke={strokeColor}
              strokeWidth="1"
            />
          );
        }
        
        // Connection dots at intersections (every other intersection for performance)
        for (let x = 0; x <= graphMaxX; x += gridSize * 2) {
          for (let y = 0; y <= graphMaxY; y += gridSize * 2) {
            elements.push(
              <Circle
                key={`dot-${x}-${y}`}
                cx={x}
                cy={y}
                r={dotRadius}
                fill={dotColor}
              />
            );
          }
        }
        
        // Subtle diagonal lines for depth (fewer for performance)
        const diagonalSpacing = gridSize * 3;
        for (let i = -height; i < width + height; i += diagonalSpacing) {
          elements.push(
            <Line
              key={`d-${i}`}
              x1={Math.max(0, i)}
              y1={Math.min(height, i + height)}
              x2={Math.min(width, i + height)}
              y2={Math.max(0, i)}
              stroke={`rgba(184, 158, 246, ${opacity * 0.5})`}
              strokeWidth="0.8"
            />
          );
        }
        break;
    }
    
    return elements;
  }, [width, height, patternType, strokeColor, dotColor, opacity]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {patternElements}
      </Svg>
    </View>
  );
}

