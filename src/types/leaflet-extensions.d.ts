import 'leaflet';

declare module 'leaflet' {
  namespace L {
    function markerClusterGroup(options?: any): any;
  }
}