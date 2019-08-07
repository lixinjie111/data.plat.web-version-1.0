/**
 * 模糊搜索方法封装
 */
class SearchFilter {
    constructor(){

    }
    static publicRemoteMethod(option) {
        if (option.query !== '') {
            option.searchOption.loading = true;
            clearTimeout(option.searchOption.timer);
            option.searchOption.timer = setTimeout(() => {
                this.requestRoadSideTypeahead(option);
            }, 500);
        } else {
            option.searchOption.filterOption = option.searchOption.defaultOption;
        }
    }
    static remoteMethodClick(searchOption, searchObj, key, request) {
        if(searchObj[key] == '') {
            if(!searchOption.defaultFlag) {
                searchOption.loading = true;
                this.requestRoadSideTypeahead({
                    query: '',
                    searchOption: searchOption,
                    searchObj: searchObj,
                    key: key,
                    request: request
                });
            }else {
                searchOption.filterOption = searchOption.defaultOption;
            }
        }
    }
    static requestRoadSideTypeahead(option) {
        let _params = {};
        _params[option.key] = option.query || option.searchObj[option.key];

        option.request(_params).then(res => {
            option.searchOption.loading = false;
            if(!option.searchOption.defaultFlag) {
                option.searchOption.defaultOption = res.data || [];
                option.searchOption.defaultFlag = true;
            }
            option.searchOption.filterOption = res.data;
        }).catch(err => {
            option.searchOption.loading = false;
        });
    }
    static remoteMethodBlur(searchObj, key) {
        searchObj[key] = this.queryName;
    }
}
export default SearchFilter;
