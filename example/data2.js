var ganttData = [
{
	id: "001", name: "FEATURE1", records: [
		{
			id: 1, name: "Feature 1", series: [
				{
					name: "大塚", items: [
						{ start: "2010-01-01", end: "2010-01-03" },
						{ start: "2010-01-05", end: "2010-01-07" }
					]
				},
				{
					name: "加藤", items: [
						{ start: "2010-01-02", end: "2010-01-05", color: "#f0f0f0" }
					]
				}
			]
		}, 
		{
			id: 2, name: "Feature 2", series: [
				{
					name: "大塚", items: [
						{ start: "2010-01-05", end: "2010-01-20" }
					]
				},
				{
					name: "加藤", items: [
						{ start: "2010-01-06", end: "2010-01-17", color: "#f0f0f0" }
					]
				},
				{
					name: "井上", items: [
						{ start: "2010-01-06", end: "2010-01-17", color: "#e0e0e0" }
					]
				}
			]
		}, 
		{
			id: 3, name: "Feature 3", series: [
				{
					name: "大塚", items: [
						{ start: "2010-01-11", end: "2010-02-03" }
					]
				},
				{
					name: "加藤", items: [
						{ start: "2010-01-15", end: "2010-02-03", color: "#f0f0f0" }
					]
				}
			]
		},
		{
			id: 4, name: "Feature 4", series: [
				{
					name: "大塚", items: [
						{ start: "2010-02-01", end: "2010-02-03" }
					]
				},
				{
					name: "加藤", items: [
						{ start: "2010-02-01", end: "2010-02-05", color: "#f0f0f0" }
					]
				}
			]
		}
	]
},
{
	id: "002", name: "FEATURE2", records: [
		{
			id: 5, name: "Feature 5", series: [
				{
					name: "木藤", items: [
						{ start: "2010-03-01", end: "2010-04-20" }
					]
				},
				{
					name: "加藤", items: [
						{ start: "2010-03-01", end: "2010-04-26", color: "#f0f0f0" }
					]
				}
			]
		}, 
		{
			id: 6, name: "Feature 6", series: [
				{
					name: "木藤", items: [
						{ start: "2010-01-05", end: "2010-01-20" }
					]
				},
				{
					name: "大塚", items: [
						{ start: "2010-01-06", end: "2010-01-17", color: "#f0f0f0" }
					]
				},
				{
					name: "加藤", items: [
						{ start: "2010-01-06", end: "2010-01-20", color: "#e0e0e0" }
					]
				}
			]
		}, 
		{
			id: 7, name: "Feature 7", series: [
				{
					name: "佐藤", items: [
						{ start: "2010-01-11", end: "2010-02-03" }
					]
				}
			]
		}, 
		{
			id: 8, name: "Feature 8", series: [
				{
					name: "木藤", items: [
						{ start: "2010-02-01", end: "2010-02-03" }
					]
				},
				{
					name: "井上", items: [
						{ start: "2010-02-01", end: "2010-02-05", color: "#f0f0f0" }
					]
				}
			]
		}
	]
}
];