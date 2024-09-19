export default function formatTimeLabel(label) {
    const t_rxp_1 = /^0+(\d+)/;
    const t_rxp_2 = /:0+(\d+)/g;
    const t_rxp_3 = /\.0+(\d+)/;
    return label.replace(t_rxp_1, '$1')
        .replace(t_rxp_2, ':$1')
        .replace(t_rxp_3, '.$1');
}