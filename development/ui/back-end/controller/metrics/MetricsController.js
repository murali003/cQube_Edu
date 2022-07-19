const { getFileData } = require("../../service/storage_service");
const _ = require('lodash');

exports.getDashboardMetrics = async (req, res, next) => {
	return new Promise(async function (resolve, reject) {
		let { appName, forMenu } = req.params;

		try {
			if (!appName) {
				throw "Some of the parameters are missing, make sure all the required parameters are present";
			}

			let metrics = await getFileData('dashboard/key_vanity_metrics.json');
            metrics = metrics.filter(metric => metric['Metric Type'] === 'Key Metric');

            metricsRes = _.chain(metrics)
                .groupBy("Program ID")
                .map((objs, key) => {
                    let data = {
                        programId: key,
                        title: forMenu && forMenu === 'true' ? objs[0]['Menu Name'] : objs[0]['Program'],
                        metrics: [],
						tooltip: objs[0]['Program Information'],
						navigationURL: objs[0]['Navigation URL'],
						icon: objs[0]['Image URL']
                    };

                    data.metrics = objs.map(metric => {
						//data.tooltip += data.tooltip.length > 0 ? `<br>${metric['Metric Information']}` : `${metric['Metric Information']}`;
                        return {
                            name: metric['Metric Name'],
                            value: metric['Metric Value'] && metric['Metric Value'] !== '' ? metric['Metric Value'] : 0,
                            tooltip: metric['Metric Information']
                        }
                    });

                    return data;
                });

			res.status(200).send({
				status: 200,
				result: metricsRes
			});
		} catch (error) {
			res.send({
				status: error.status || 500,
				message: error.message || "Internal server error",
				errorObject: error
			});
		}
	});
}

exports.getVanityMetrics = async (req, res, next) => {
	return new Promise(async function (resolve, reject) {
		let { appName, programId } = req.params;
        
		try {
			if (!appName || !programId) {
				throw "Some of the parameters are missing, make sure all the required parameters are present";
			}

			let metrics = await getFileData('dashboard/key_vanity_metrics.json');
            vanityMetrics = metrics.filter(metric => metric['Program ID'] === programId && metric['Metric Type'] === 'Vanity Metric' && metric['Metric Name']);

			vanityMetrics = vanityMetrics.map(vanityMetric => {
				return {
					name: vanityMetric['Metric Name'],
					value: vanityMetric['Metric Value'] ? vanityMetric['Metric Value'] : 0,
					tooltip: vanityMetric['Metric Information']
				};
			});

			res.status(200).send({
				status: 200,
				result: vanityMetrics
			});
		} catch (error) {
			res.send({
				status: error.status || 500,
				message: error.message || "Internal server error",
				errorObject: error
			});
		}
	});
}
