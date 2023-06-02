import { TaskQueue } from './task-queue'

export function createLander() {

}

/**
 * const lander = createLander()
 * const root = lander.addNode({ title: '编辑器开发值班' })
 * const node1 = lander.addNode({ title: '复现用户内容' }, root)
 * lander.addNode({ title: '历史问题查询' }, root)
 *
 * const session = lander.addConversation(node1)
 * const message = lander.addMessage('你好', session)
 * 
 * const space = new GitSpace(config)
 * space.addDocument('README.md', 'hello world')
 * space.updateDocument('README.md', 'hello world')
 * 
 * const shortcut = new GitShortcut(config)
 * shortcut.newWay(filepath)
 * shortcut.updateWay(filepath)
 * shortcut.deleteWay(filepath)
 */

abstract class LanderProvider { 
    abstract query(data: any): Promise<any>
}

export class TextLanderProvider extends LanderProvider {
    async query(data: any) {
        return ''
    }
}

