// Type definitions for amfjs
// Project: https://github.com/emilkm/amfjs
// Definitions by: Emil Malinov
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace amf {
    var classes: any[];
    var clients: Client[];

    function registerClass(name: string, clazz: any);
    function getClient(destination: string): Client;

    class Client {
        constructor(destination: string, endpoint: string, timeout?: number);
        setSessionId(value: string);
        releaseQueue();
        invoke<Response>(source: string, operation: string, params: any, block: boolean = false, nobatch: boolean = false): Promise<Response>;
    }

    interface ResponseFactory {
        new (code, message, detail, data, $scope): Response;
    }
    var Response: ResponseFactory;
    interface Response {
        $scope: any;
        code: number;
        message: string;
        detail: any;
        data: any;
    }
}
