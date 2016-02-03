'use strict';

const constants = {
	GRAPH: 'graph',
	INTERFACE: 'interface',

	MODEL_LIBRARY: 'model-library',
	MODEL_COMPONENTS_LIBRARY: 'component-lib.json',
	MODEL_PATTERNS_LIBRARY: 'pattern-lib.json',
	MODEL_RELATIONS_LIBRARY: 'relation-lib.json',
	MODEL_KNOWLEDGEBASE: 'knowledgebase.json',

	// ANALYSIS_TOOLS: 'analysis-tools.json',

	// dnd drop targets
	DND_TARGET_MAP: 'model-map',
	DND_TARGET_DEBUG: 'debug-view',
	// dnd drag sources
	DND_SOURCE_NODE: 'node',
	DND_SOURCE_FRAGMENT: 'fragment',

	// ——— action types ————
	ACTION_setEditorElem: 'ACTION_setEditorElem',
	ACTION_select: 'ACTION_select',
	ACTION_showContextMenu: 'ACTION_showContextMenu',
	ACTION_hideContextMenu: 'ACTION_hideContextMenu',
	ACTION_setShowGroups: 'ACTION_setShowGroups',
	ACTION_setShowImages: 'ACTION_setShowImages',
	ACTION_setShowEdges: 'ACTION_setShowEdges',
	ACTION_removeGroupBackgroundImage: 'ACTION_removeGroupBackgroundImage',
	ACTION_addGroupBackgroundImage: 'ACTION_addGroupBackgroundImage',
	ACTION_resizeGroupBackgroundImage: 'ACTION_resizeGroupBackgroundImage',
	ACTION_moveGroupBackgroundImage: 'ACTION_moveGroupBackgroundImage',
	ACTION_backgroundImageToNodes: 'ACTION_backgroundImageToNodes',
	ACTION_setTransformation: 'ACTION_setTransformation',
	ACTION_setPreviewEdge: 'ACTION_setPreviewEdge',
	ACTION_setDrag: 'ACTION_setDrag',
	ACTION_setDragNode: 'ACTION_setDragNode',
	ACTION_setHoverNode: 'ACTION_setHoverNode',
	ACTION_setHoverGroup: 'ACTION_setHoverGroup',
	ACTION_addNode: 'ACTION_addNode',
	ACTION_addNodeToGroup: 'ACTION_addNodeToGroup',
	ACTION_cloneNode: 'ACTION_cloneNode',
	ACTION_removeNode: 'ACTION_removeNode',
	ACTION_moveNode: 'ACTION_moveNode',
	ACTION_ungroupNode: 'ACTION_ungroupNode',
	ACTION_addGroup: 'ACTION_addGroup',
	ACTION_moveGroup: 'ACTION_moveGroup',
	ACTION_cloneGroup: 'ACTION_cloneGroup',
	ACTION_removeGroup: 'ACTION_removeGroup',
	ACTION_setSpacePressed: 'ACTION_setSpacePressed',
	ACTION_setMouseOverEditor: 'ACTION_setMouseOverEditor',
	ACTION_setPanning: 'ACTION_setPanning',
	ACTION_setPannable: 'ACTION_setPannable',
	ACTION_selectWizardStep: 'ACTION_selectWizardStep',
	ACTION_importModelFragment: 'ACTION_importModelFragment',
	ACTION_downloadAsXML: 'ACTION_downloadAsXML',
	ACTION_loadXMLFile: 'ACTION_loadXMLFile',
	ACTION_loadXML: 'ACTION_loadXML',
	ACTION_loadXML_DONE: 'ACTION_loadXML_DONE',
	ACTION_updateModel: 'ACTION_updateModel',
	ACTION_addEdge: 'ACTION_addEdge',
	ACTION_removeEdge: 'ACTION_removeEdge',
	ACTION_updateComponentProperties: 'ACTION_updateComponentProperties',
	ACTION_attackerProfileChanged: 'ACTION_attackerProfileChanged',
	ACTION_setAttackerGoal: 'ACTION_setAttackerGoal',

	CLONE_OFFSET: 100,
};


module.exports = constants;
