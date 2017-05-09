import { ICluster, ConnectorType, IConnector } from 'modules/hercules/hybrid-services.types';
import { Notification } from 'modules/core/notifications/notification.service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

interface INodes {
  hostname: string;
  connectors: IConnector[];
}

export class NodeListComponentCtrl implements ng.IComponentController {

  public cluster: ICluster;
  public hosts;
  public connectorType;
  public getSeverity = this.HybridServicesClusterStatesService.getSeverity;
  public localizedManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.c_mgmt');
  public localizedConnectorName = this.$translate.instant(`hercules.connectorNameFromConnectorType.${this.connectorType}`);
  public localizedContextManagementConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.cs_mgmt');
  public localizedContextConnectorName = this.$translate.instant('hercules.connectorNameFromConnectorType.cs_context');
  public loading: boolean = true;

  /* @ngInject */
  constructor(
    public $translate: ng.translate.ITranslateService,
    public FusionClusterService,
    public HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    public Notification: Notification,
  ) {}

  public $onInit() {
    if (this.cluster) {
      this.FusionClusterService.get(this.cluster.id)
        .then(cluster => {
          this.hosts = this.buildSidepanelConnectorList(cluster, this.connectorType);
        })
        .catch((error) => {
          this.Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }

  public sortConnectors(connector): number {
    if (connector.connectorType === 'c_mgmt') {
      return -1;
    } else {
      return 1;
    }
  }

  public hasConnectors = () => {
    return this.cluster && this.cluster.connectors.length > 0;
  }

  private buildSidepanelConnectorList(cluster: ICluster, connectorTypeToKeep: ConnectorType): INodes[] {
    // Find and populate hostnames only, and make sure that they are only there once
    const nodes: INodes[] = _.chain(cluster.connectors)
      .map(connector => {
        return {
          hostname: connector.hostname,
          connectors: [],
        };
      })
      .uniqBy(host => host.hostname)
      .value();

    // Find and add all c_mgmt connectors (always displayed no matter the current service pages we are looking at)
    // plus the connectors we're really interested in
    _.forEach(cluster.connectors, connector => {
      if (connector.connectorType === 'c_mgmt' || connector.connectorType === connectorTypeToKeep || connector.connectorType === 'cs_context' || connector.connectorType === 'cs_mgmt') {
        let node = _.find(nodes, node => {
          return node.hostname === connector.hostname;
        });
        node.connectors.push(connector);
      }
    });
    return nodes;
  }
}

export class NodeListComponent implements ng.IComponentOptions {
  public controller = NodeListComponentCtrl;
  public templateUrl = 'modules/hercules/cluster-sidepanel/node-list/node-list.html';
  public bindings = {
    cluster: '<',
    connectorType: '<',
  };
}
