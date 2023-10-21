import { useEffect } from 'react';
import * as echarts from 'echarts';
import useSize from '../useSize';

function useECharts(
  chartRef: any,
  config: { [propName: string]: any },
): undefined {
  let chartInstance: any;
  const dom = document.querySelector('body');

  const pageSize = useSize(dom);

  function renderChart() {
    const renderedInstance = echarts.getInstanceByDom(chartRef.current);
    if (renderedInstance) {
      chartInstance = renderedInstance;
    } else {
      chartInstance = echarts.init(chartRef.current);
    }
    chartInstance.setOption(config, true);
    chartInstance.resize();
  }

  useEffect(() => {
    renderChart();
  }, [config, pageSize]);

  useEffect(() => {
    return () => {
      chartInstance && chartInstance.dispose();
    };
  }, []);

  return;
}

export default useECharts;
