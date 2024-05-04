import ScratchStorage from 'scratch-storage';

import defaultProject from './default-project';
import api from './api';


/**
 * Wrapper for ScratchStorage which adds default web sources.
 * @todo make this more configurable
 */
class Storage extends ScratchStorage {
    constructor () {
        super();
        this.cacheDefaultProject();
    }

    addOfficialScratchWebStores () {
        this.addWebStore(
            [this.AssetType.Project],
            this.getProjectGetConfig.bind(this),
            this.getProjectCreateConfig.bind(this),
            this.getProjectUpdateConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.ImageVector, this.AssetType.ImageBitmap, this.AssetType.Sound],
            this.getAssetGetConfig.bind(this),
            // We set both the create and update configs to the same method because
            // storage assumes it should update if there is an assetId, but the
            // asset store uses the assetId as part of the create URI.
            this.getAssetCreateConfig.bind(this),
            this.getAssetCreateConfig.bind(this)
        );
        this.addWebStore(
            [this.AssetType.Sound],
            asset => `static/extension-assets/scratch3_music/${asset.assetId}.${asset.dataFormat}`
        );
    }

    setProjectHost (projectHost) {
        this.projectHost = projectHost;
    }

    setProjectToken (projectToken) {
        this.projectToken = projectToken;
    }

    getProjectGetConfig (projectAsset) {
        const path = `${this.projectHost}/${projectAsset.assetId}`;
        const qs = this.projectToken ? `?token=${this.projectToken}` : '';
        return path + qs;
    }

    getProjectCreateConfig () {
        return {
            url: `${this.projectHost}/`,
            withCredentials: true
        };
    }

    getProjectUpdateConfig (projectAsset) {
        return {
            url: `${this.projectHost}/${projectAsset.assetId}`,
            withCredentials: true
        };
    }

    setAssetHost (assetHost) {
        this.assetHost = assetHost;
    }

    getAssetGetConfig (asset) {
        // TODO 这里应该通过oss client利用assetId去拿到图片
        return api.getAssetUrlForGet(`${asset.assetId}.${asset.dataFormat}`);
    }
    getAssetCreateConfig (asset) {
        return {
            // There is no such thing as updating assets, but storage assumes it
            // should update if there is an assetId, and the asset store uses the
            // assetId as part of the create URI. So, force the method to POST.
            // Then when storage finds this config to use for the "update", still POSTs
            method: 'post',
            url: `${this.assetHost}/${asset.assetId}.${asset.dataFormat}`,
            withCredentials: true,
            headers: {
                'Content-Disposition': `attachment; filename="${asset.assetId}.${asset.dataFormat}"`
            }
        };
    }
    setTranslatorFunction (translator) {
        this.translator = translator;
        this.cacheDefaultProject();
    }
    cacheDefaultProject () {
        const defaultProjectAssets = defaultProject(this.translator);
        defaultProjectAssets.forEach(asset => this.builtinHelper._store(
            this.AssetType[asset.assetType],
            this.DataFormat[asset.dataFormat],
            asset.data,
            asset.id
        ));
    }
}

const storage = new Storage();

export default storage;
