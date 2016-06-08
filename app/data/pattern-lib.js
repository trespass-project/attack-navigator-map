module.exports = [
	{
		'type': 'template',
		'isFragment': true,
		'value': {
			'nodes': [
				{
					'modelComponentType': 'location',
					'id': 'room1',
					'x': 240,
					'y': -70,
					'type': 'tkb:room',
					'label': 'Room 1'
				},
				{
					'modelComponentType': 'location',
					'id': 'room2',
					'x': 240,
					'y': 70,
					'type': 'tkb:room',
					'label': 'Room 2'
				},
				{
					'modelComponentType': 'location',
					'id': 'door1',
					'x': 130,
					'y': -70,
					'type': 'tkb:door',
					'label': 'Door 1'
				},
				{
					'modelComponentType': 'location',
					'id': 'door2',
					'x': 130,
					'y': 70,
					'type': 'tkb:door',
					'label': 'Door 2'
				},
				{
					'modelComponentType': 'location',
					'id': 'corridor',
					'x': 1,
					'y': 1,
					'type': 'tkb:room',
					'label': 'Corridor'
				}
			],
			'edges': [
				{
					'id': 'a',
					'from': 'corridor',
					'to': 'door1',
					'relation': 'connects'
				},
				{
					'id': 'b',
					'from': 'corridor',
					'to': 'door2',
					'relation': 'connects'
				},
				{
					'id': 'c',
					'from': 'door1',
					'to': 'room1',
					'relation': 'connects'
				},
				{
					'id': 'd',
					'from': 'door2',
					'to': 'room2',
					'relation': 'connects'
				}
			],
			'groups': [
				{
					'label': 'Building',
					'id': 'building',
					'nodeIds': ['room1', 'room2', 'corridor', 'door1', 'door2']
				}
			]
		},
		'label': 'Buildung pattern'
	},


	{
		'type': 'template',
		'isFragment': true,
		'value': {
			'nodes': [
				{
					'modelComponentType': 'location',
					'id': 'RoomInternal',
					'type': 'tkb:room',
					'label': 'RoomInternal'
				},
				{
					'modelComponentType': 'location',
					'id': 'RoomDatacenter',
					'type': 'tkb:room',
					'label': 'RoomDatacenter'
				}
			],
			'edges': [],
			'groups': [
				{
					'label': 'Cloud rooms',
					'id': 'cloud-rooms',
					'nodeIds': ['RoomInternal', 'RoomDatacenter']
				}
			]
		},
		'label': 'Cloud rooms'
	},


	{
		'type': 'template',
		'isFragment': true,
		'value': {
			'nodes': [
				{
					'modelComponentType': 'item',
					'id': 'vm1',
					'x': 300,
					'y': 1,
					'type': 'tkb:vmware-virtualmachine',
					'label': 'VM1'
				},
				{
					'modelComponentType': 'item',
					'id': 'vm2',
					'x': 300,
					'y': 100,
					'type': 'tkb:vmware-virtualmachine',
					'label': 'VM2'
				},
				{
					'modelComponentType': 'data',
					'id': 'file1',
					'x': 450,
					'y': 1,
					'type': 'tkb:file',
					'value': '42',
					'label': 'File 1'
				},
				{
					'modelComponentType': 'data',
					'id': 'file2',
					'x': 450,
					'y': 100,
					'type': 'tkb:file',
					'value': '42',
					'label': 'File 2'
				},
				{
					'modelComponentType': 'item',
					'id': 'vsw',
					'x': 150,
					'y': 50,
					'type': 'tkb:vmware-network',
					'label': 'Virtual switch'
				},
				{
					'modelComponentType': 'item',
					'id': 'vfw',
					'x': 1,
					'y': 50,
					'type': 'tkb:vmware-firewall',
					'label': 'Virtual firewall'
				}
			],
			'edges': [
				{
					'id': 'a',
					'from': 'vfw',
					'relation': 'network',
					'to': 'vsw'
				},
				{
					'id': 'b',
					'from': 'vsw',
					'relation': 'network',
					'to': 'vm1'
				},
				{
					'id': 'c',
					'from': 'vsw',
					'relation': 'network',
					'to': 'vm2'
				},
				{
					'id': 'd',
					'to': 'vm1',
					'from': 'file1',
					'relation': 'atLocation',
					'directed': true
				},
				{
					'id': 'e',
					'to': 'vm2',
					'from': 'file2',
					'relation': 'atLocation',
					'directed': true
				}
			],
			'groups': [
				{
					'label': 'Virtual network',
					'id': 'virtual-network',
					'nodeIds': ['vfw', 'vsw', 'vm1', 'vm2', 'file1', 'file2']
				}
			]
		},
		'label': 'Virtual network pattern'
	},


	{
		'type': 'pattern',
		'isFragment': true,
		'value': {
			'nodes': [
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_employee_it',
					'label': 'Terry',
					'id': 'Terry'
				},
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_other',
					'label': 'Cleo',
					'id': 'Cleo'
				},
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_other',
					'label': 'Grey',
					'id': 'Grey'
				},
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_management',
					'label': 'Mr_Big',
					'id': 'Mr_Big'
				},
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_employee_it',
					'label': 'Sydney',
					'id': 'Sydney'
				},
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_employee',
					'label': 'Finn',
					'id': 'Finn'
				},
				{
					'modelComponentType': 'actor',
					'type': 'tkb:actor',
					'tkb:actor_type': 'tkb:actor_employee_trained',
					'label': 'Ethan',
					'id': 'Ethan'
				}
			],
			'edges': [],
			'groups': [
				{
					'label': 'Cloud actors',
					'nodeIds': [
						'Terry',
						'Cleo',
						'Grey',
						'Mr_Big',
						'Sydney',
						'Finn',
						'Ethan'
					]
				}
			],
			'predicates': [
				{
					'id': 'isUidOf',
					'arity': '2',
					'value': [
						['terry', 'Terry'],
						['finn', 'Finn']
					]
				}
			]
		},
		'label': 'Cloud actors'
	},


	{
		'type': 'pattern',
		'isFragment': true,
		'value': {
			'nodes': [
				{
					'modelComponentType': 'item',
					'type': 'tkb:laptop',
					'tkb:os': 'tkb:os_ms_win',
					'tkb:name': 'Laptop',
					'label': 'Laptop',
					'id': 'laptop'
				}
			],
			'edges': [],
			'groups': [],
			'processes': [
				{
					'actions': {
						'in': [
							{
								'loc': 'laptop',
								'tuple': {
									'value': 'get',
									'variable': [
										'fileName',
										'Uid',
										'Targethost'
									]
								},
								'variable': [
									'Uid',
									'Pwd'
								]
							},
							{
								'loc': 'laptop',
								'variable': [
									'fileName',
									'fileContent'
								]
							}
						],
						'out': {
							'loc': 'laptop',
							'tuple': {
								'variable': [
									'Uid',
									'fileName',
									'fileContent'
								]
							},
							'variable': 'TargetHost'
						}
					},
					'atLocations': [
						'laptop'
					],
					'id': 'pr_laptop_001',
					'modelComponentType': 'process'
				}
			],
			'policies': [
				{
					'atLocations': [
						'laptop'
					],
					'credentials': {
						'credPredicate': [
							{
								'name': 'isUserIdAt',
								'value': 'laptop',
								'variable': 'X'
							},
							{
								'name': 'isPasswordOf',
								'variable': [
									'X',
									'Y'
								]
							}
						]
					},
					'enabled': {
						'out': {
							'loc': 'laptop',
							'tuple': {
								'value': 'get',
								'wildcard': [
									'',
									''
								]
							},
							'variable': [
								'X',
								'Y'
							]
						}
					},
					'id': 'p_laptop_001',
					'modelComponentType': 'policy'
				}
			]
		},
		'label': 'Laptop'
	},


	{
		'type': 'pattern',
		'isFragment': true,
		'value': {
			'edges': {
				'id-4JW1F1Bo1W-edge': {
					'directed': true,
					'from': 'adminpin',
					'id': 'id-4JW1F1Bo1W-edge',
					'relation': 'atLocation',
					'to': 'admincard'
				},
				'id-4k7kYkSoJZ-edge': {
					'directed': true,
					'from': 'userpin',
					'id': 'id-4k7kYkSoJZ-edge',
					'relation': 'atLocation',
					'to': 'usercard'
				}
			},
			'groups': [
				{
					'label': 'Cloud cards',
					'nodeIds': [
						'admincard',
						'adminpin',
						'usercard',
						'userpin'
					]
				}
			],
			'nodes': {
				'admincard': {
					'id': 'admincard',
					'label': 'admincard',
					'name': 'admincard',
					'type': 'tkb:item',
					'modelComponentType': 'item'
				},
				'adminpin': {
					'id': 'adminpin',
					'label': 'adminpin',
					'name': 'adminpin',
					'type': 'tkb:data',
					'modelComponentType': 'data',
					'value': '42'
				},
				'usercard': {
					'id': 'usercard',
					'label': 'usercard',
					'name': 'usercard',
					'type': 'tkb:item',
					'modelComponentType': 'item'
				},
				'userpin': {
					'id': 'userpin',
					'label': 'userpin',
					'name': 'userpin',
					'type': 'tkb:data',
					'modelComponentType': 'data',
					'value': '43'
				}
			}
		},
		'label': 'Cloud cards'
	}
];
