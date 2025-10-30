import React, { useState } from 'react';

interface CreoViewerProps {
  modelPath: string;
  title?: string;
  width?: string;
  height?: string;
}

export const CreoViewer: React.FC<CreoViewerProps> = ({
  modelPath,
  title = "Creo Parametric Model",
  width = "100%",
  height = "500px"
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const integrationOptions = [
    {
      name: "PTC Creo View",
      description: "Native web viewer from PTC for Creo models",
      status: "Available",
      requirements: "Creo View license, PTC server",
      implementation: "Direct integration with PTC's web services"
    },
    {
      name: "Creo Illustrate",
      description: "Advanced technical illustrations and animations",
      status: "Available",
      requirements: "Creo Illustrate license",
      implementation: "Export to WebGL/HTML5 format"
    },
    {
      name: "Windchill RV&S",
      description: "Requirements and validation integration",
      status: "Available",
      requirements: "Windchill license",
      implementation: "Embedded viewer in documentation"
    },
    {
      name: "Model Conversion",
      description: "Convert Creo models to GLTF/GLB for web viewing",
      status: "In Development",
      requirements: "Creo Parametric, conversion script",
      implementation: "Automated pipeline for model conversion"
    }
  ];

  return (
    <div style={{
      width,
      height,
      border: '2px solid #e1e4e8',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #e1e4e8',
        backgroundColor: '#f6f8fa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#06b6d4',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🔧
          </div>
          <div>
            <h3 style={{
              margin: '0 0 4px 0',
              color: '#1b1f23',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {title}
            </h3>
            <p style={{
              margin: '0',
              color: '#586069',
              fontSize: '14px',
              fontFamily: 'monospace'
            }}>
              {modelPath}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px', height: 'calc(100% - 89px)', overflowY: 'auto' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          backgroundColor: '#fafbfc',
          borderRadius: '8px',
          border: '2px dashed #d1d5db',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', color: '#6b7280' }}>
            📐
          </div>
          <p style={{
            margin: '0',
            color: '#586069',
            fontSize: '16px',
            textAlign: 'center'
          }}>
            Interactive Creo model viewer<br/>
            <span style={{ fontSize: '14px', color: '#8b949e' }}>
              Coming with PTC Creo View integration
            </span>
          </p>
        </div>

        {/* Integration Options */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h4 style={{
              margin: '0',
              color: '#1b1f23',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Integration Options
            </h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#586069',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {integrationOptions.map((option, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  border: '1px solid #e1e4e8',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#06b6d4';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(6, 182, 212, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e1e4e8';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: showDetails ? '12px' : '0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: option.status === 'Available' ? '#28a745' : '#ffd33d'
                    }}></div>
                    <h5 style={{
                      margin: '0',
                      color: '#1b1f23',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {option.name}
                    </h5>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: option.status === 'Available' ? '#f6ffed' : '#fffbeb',
                    color: option.status === 'Available' ? '#52c41a' : '#d97706',
                    border: `1px solid ${option.status === 'Available' ? '#b7eb8f' : '#fcd34d'}`
                  }}>
                    {option.status}
                  </span>
                </div>

                {showDetails && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{
                      margin: '0 0 8px 0',
                      color: '#586069',
                      fontSize: '13px'
                    }}>
                      {option.description}
                    </p>
                    <div style={{ fontSize: '12px', color: '#8b949e' }}>
                      <div><strong>Requirements:</strong> {option.requirements}</div>
                      <div><strong>Implementation:</strong> {option.implementation}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f6f8fa',
          borderRadius: '8px',
          border: '1px solid #e1e4e8',
          textAlign: 'center'
        }}>
          <p style={{
            margin: '0 0 12px 0',
            color: '#586069',
            fontSize: '14px'
          }}>
            Ready to integrate Creo models directly into your documentation?
          </p>
          <button style={{
            backgroundColor: '#06b6d4',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            Contact Integration Team
          </button>
        </div>
      </div>
    </div>
  );
};
