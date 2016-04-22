# trespass.js
✔ working eslint, babel, etc. setup
✔ immutability
- more testing
- start collecting attack tree functions


# AN
- maybe the an front page can show the pipeline more prominently
	- see one of jeroen's early sketches
- build a tool chain editor
- intro tour: https://www.npmjs.com/package/react-joyride


# ANM
- __tasks__
	+ clean up
		✔ proper babel / eslint setup
		* get rid of fake api
		* all apis use fetch()
		* all apis go to to trespass.js
	* find dead code
	* more testing
	* ui testing
	* update results visualization components
		- clean up
		- make standalone package
	- improve arrow head
	- update to react 0.15
		+ what's new wrt svg?
	- `import` model — next to `load` model
	- attacker profile editor
		- color scales should match
		- highlight things on hover
	- predicate editor
	- new edges: infer relation type — preselect that
	- solve performance issues
	- process editor
	- policy editor
	- on import
		- query kb for component types, and update components?
			+ should actually be in `anm_data`
	- select multiple items
		+ drag selection rectangle
		+ edit multiple properties at the same time
		- for nodes
			- context menu: "group items"
			- should be savable as model fragments
	- better auto-layout
		+ https://github.com/mbostock/d3/wiki/Force-Layout
	- performance
	- function to fit map to editor
	- show warnings directly on map
	- search for elements on map
		+ jump to results
	- context menu
		+ multi-level menu
		+ root + group context menu: load model into group
- __wish list__
	+ import svg as fragment
	- export model thumbnail: include in zip
	- when creating new node, show relation selection dropdown
	- collapse / expand groups
	+ locations as groups
	- model outline
		+ on click: pan / zoom to component
	+ nested groups / sub-components
	+ different layers / gazes
	- with multiple nodes selected, drag multiple edges to one target
	- update minimap
		- draggable rectangle to pan editor
	- keyboard navigation (like omnigraffle)
- __bugs__
	- dragging node into group is slightly broken
