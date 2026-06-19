import React, { useState } from 'react';
import { 
  ChevronDown, ChevronRight, Plus, Trash2, CheckCircle, Circle, 
  Edit3, Calendar, Layers, CheckSquare, Clock, Hourglass, Zap, Sparkles 
} from 'lucide-react';

const LEVELS = [
  { name: '연도 (Year)', label: '연도 계획', icon: Calendar, color: '#ec4899' },
  { name: '달 (Month)', label: '월간 계획', icon: Layers, color: '#3b82f6' },
  { name: '주 (Week)', label: '주간 계획', icon: Layers, color: '#10b981' },
  { name: '1일 (Day)', label: '일일 계획', icon: CheckSquare, color: '#f59e0b' },
  { name: '시간 (Hour)', label: '시간 계획', icon: Clock, color: '#8b5cf6' },
  { name: '분 (Minute)', label: '분 단위 계획', icon: Hourglass, color: '#06b6d4' },
  { name: '초 (Second)', label: '초 단위 계획', icon: Zap, color: '#ef4444' }
];

export default function HierarchicalPlanner({ plans, setPlans }) {
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newRootText, setNewRootText] = useState('');

  // Helper: Get node progress based on children completion
  const getNodeProgress = (node) => {
    if (!node.children || node.children.length === 0) {
      return node.completed ? 100 : 0;
    }
    const totalChildren = node.children.length;
    const completedChildren = node.children.filter(child => child.completed).length;
    
    // Recursive progress calculation
    let totalProgress = 0;
    node.children.forEach(child => {
      totalProgress += getNodeProgress(child);
    });
    return Math.round(totalProgress / totalChildren);
  };

  // Helper: Find and update a node inside the tree recursively
  const updateNodeInTree = (nodes, targetId, updateFn) => {
    return nodes.map(node => {
      if (node.id === targetId) {
        return updateFn(node);
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateNodeInTree(node.children, targetId, updateFn)
        };
      }
      return node;
    });
  };

  // Helper: Find and delete a node recursively
  const deleteNodeFromTree = (nodes, targetId) => {
    return nodes
      .filter(node => node.id !== targetId)
      .map(node => {
        if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: deleteNodeFromTree(node.children, targetId)
          };
        }
        return node;
      });
  };

  // Actions
  const handleAddRoot = (e) => {
    e.preventDefault();
    if (!newRootText.trim()) return;

    const newRoot = {
      id: `plan-${Date.now()}`,
      text: newRootText,
      level: 0, // Year
      completed: false,
      expanded: true,
      children: []
    };

    setPlans([...plans, newRoot]);
    setNewRootText('');
  };

  const handleAddChild = (parentId, parentLevel) => {
    const childLevel = parentLevel + 1;
    if (childLevel >= LEVELS.length) return; // Max level reached (Second)

    const childText = `${LEVELS[childLevel].label} 항목`;
    const newChild = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: childText,
      level: childLevel,
      completed: false,
      expanded: true,
      children: []
    };

    const updated = updateNodeInTree(plans, parentId, (node) => ({
      ...node,
      expanded: true,
      children: [...node.children, newChild]
    }));

    setPlans(updated);
  };

  const handleToggleComplete = (id) => {
    // Recursive toggle (mark node and all its children as complete/incomplete)
    const toggleNodeAndChildren = (node, status) => {
      const newStatus = status !== undefined ? status : !node.completed;
      return {
        ...node,
        completed: newStatus,
        children: node.children ? node.children.map(child => toggleNodeAndChildren(child, newStatus)) : []
      };
    };

    const updated = updateNodeInTree(plans, id, (node) => toggleNodeAndChildren(node));
    setPlans(updated);
  };

  const handleToggleExpand = (id) => {
    const updated = updateNodeInTree(plans, id, (node) => ({
      ...node,
      expanded: !node.expanded
    }));
    setPlans(updated);
  };

  const handleStartEdit = (node) => {
    setEditingId(node.id);
    setEditText(node.text);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    const updated = updateNodeInTree(plans, id, (node) => ({
      ...node,
      text: editText
    }));
    setPlans(updated);
    setEditingId(null);
  };

  const handleDeleteNode = (id) => {
    const updated = deleteNodeFromTree(plans, id);
    setPlans(updated);
  };

  // Recursive Plan Node Renderer
  const renderPlanNode = (node) => {
    const LevelIcon = LEVELS[node.level].icon;
    const progress = getNodeProgress(node);
    const hasChildren = node.children && node.children.length > 0;
    const isEditing = editingId === node.id;

    return (
      <div key={node.id} className="planner-node-container fade-in">
        <div className={`planner-node level-${node.level} ${node.completed ? 'completed' : ''}`}>
          <div className="node-left">
            {/* Expand / Collapse icon */}
            {hasChildren ? (
              <button onClick={() => handleToggleExpand(node.id)} className="icon-btn expand-btn">
                {node.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            ) : (
              <div className="expand-placeholder" />
            )}

            {/* Checkbox */}
            <button onClick={() => handleToggleComplete(node.id)} className="icon-btn checkbox-btn">
              {node.completed ? (
                <CheckCircle size={18} className="checked-icon" />
              ) : (
                <Circle size={18} className="unchecked-icon" />
              )}
            </button>

            {/* Level Tag & Text */}
            <div className="node-content">
              <span 
                className="level-badge" 
                style={{ backgroundColor: LEVELS[node.level].color }}
              >
                {LEVELS[node.level].name.split(' ')[0]}
              </span>

              {isEditing ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleSaveEdit(node.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(node.id)}
                  className="node-edit-input"
                  autoFocus
                />
              ) : (
                <span className="node-text" onClick={() => handleStartEdit(node)}>
                  {node.text}
                </span>
              )}
            </div>
          </div>

          <div className="node-right">
            {/* Progress Bar for parent items */}
            {hasChildren && (
              <div className="node-progress-wrapper" title={`진척도: ${progress}%`}>
                <div className="node-progress-bar" style={{ width: `${progress}%` }}></div>
                <span className="node-progress-text">{progress}%</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="node-actions">
              {node.level < LEVELS.length - 1 && (
                <button 
                  onClick={() => handleAddChild(node.id, node.level)} 
                  className="icon-btn action-btn add-child-btn"
                  title={`${LEVELS[node.level + 1].name} 추가`}
                >
                  <Plus size={16} />
                </button>
              )}
              <button 
                onClick={() => handleDeleteNode(node.id)} 
                className="icon-btn action-btn delete-btn"
                title="삭제"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && node.expanded && (
          <div className="node-children-container">
            {node.children.map(child => renderPlanNode(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="hierarchical-planner card fade-in">
      <div className="planner-header">
        <h2 className="planner-title">
          <Sparkles size={22} className="title-icon" />
          <span>7단계 입체 계획표 (Year to Second Planner)</span>
        </h2>
        <p className="planner-desc">
          연도부터 초 단위까지 정밀한 계획을 구성하세요. 항목을 클릭하여 수정할 수 있습니다.
        </p>
      </div>

      {/* Root Addition Form (Adds a Year resolution) */}
      <form onSubmit={handleAddRoot} className="root-add-form">
        <div className="input-group">
          <Calendar size={18} className="input-icon" />
          <input
            type="text"
            placeholder="새로운 연도 계획(예: 2026년 목표 설정)을 입력하세요..."
            value={newRootText}
            onChange={(e) => setNewRootText(e.target.value)}
            className="input-field root-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <Plus size={18} />
          <span>연도 계획 추가</span>
        </button>
      </form>

      {/* Plan List Container */}
      <div className="plans-tree-container">
        {plans.length === 0 ? (
          <div className="empty-plans">
            <Calendar size={48} className="empty-icon" />
            <p>아직 등록된 계획이 없습니다.</p>
            <span>상단의 입력창을 이용해 올해의 핵심 목표를 먼저 추가해 보세요!</span>
          </div>
        ) : (
          plans.map(rootNode => renderPlanNode(rootNode))
        )}
      </div>

      <style jsx="true">{`
        .hierarchical-planner {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .planner-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .planner-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 0.25rem;
        }

        .planner-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .root-add-form {
          display: flex;
          gap: 0.75rem;
          width: 100%;
        }

        @media (max-width: 640px) {
          .root-add-form {
            flex-direction: column;
          }
        }

        .input-group {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .root-input {
          padding-left: 2.75rem !important;
        }

        .plans-tree-container {
          min-height: 250px;
          max-height: 600px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .empty-plans {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          gap: 0.5rem;
        }

        .empty-icon {
          stroke-width: 1.25;
          opacity: 0.4;
          margin-bottom: 0.5rem;
          color: var(--accent);
        }

        .empty-plans p {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-main);
        }

        .empty-plans span {
          font-size: 0.85rem;
        }

        /* Tree Node Styles */
        .planner-node-container {
          margin-top: 0.5rem;
        }

        .planner-node {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 0.8rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .planner-node:hover {
          border-color: var(--accent);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }

        .planner-node.completed {
          opacity: 0.75;
        }

        .node-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .expand-btn {
          color: var(--text-muted);
        }

        .expand-placeholder {
          width: 28px;
        }

        .checkbox-btn {
          color: var(--text-muted);
        }

        .checked-icon {
          color: var(--accent);
        }

        .node-content {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1;
        }

        .level-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: #ffffff;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .node-text {
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 1px dashed transparent;
          color: var(--text-main);
        }

        .node-text:hover {
          color: var(--accent);
          border-color: var(--accent);
        }

        .completed .node-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .node-edit-input {
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-main);
          background: transparent;
          border: none;
          border-bottom: 2px solid var(--accent);
          outline: none;
          padding: 0.1rem 0;
          width: 80%;
        }

        .node-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .node-progress-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 80px;
          background: var(--border-color);
          height: 14px;
          border-radius: 10px;
          position: relative;
          overflow: hidden;
        }

        .node-progress-bar {
          background: var(--accent);
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .node-progress-text {
          position: absolute;
          width: 100%;
          text-align: center;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-main);
          mix-blend-mode: difference;
        }

        .node-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          color: var(--text-muted);
          background: transparent;
          border: none;
        }

        .action-btn:hover {
          background: var(--accent-bg);
          color: var(--accent);
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .node-children-container {
          margin-left: 1.5rem;
          border-left: 2px dashed var(--border-color);
          padding-left: 0.75rem;
        }

        /* Indentation & styling differences per level for rich UX */
        .level-0 { border-left: 4px solid #ec4899; }
        .level-1 { border-left: 4px solid #3b82f6; }
        .level-2 { border-left: 4px solid #10b981; }
        .level-3 { border-left: 4px solid #f59e0b; }
        .level-4 { border-left: 4px solid #8b5cf6; }
        .level-5 { border-left: 4px solid #06b6d4; }
        .level-6 { border-left: 4px solid #ef4444; }

        /* Icon button overrides */
        .icon-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: var(--border-color);
        }
      `}</style>
    </div>
  );
}
